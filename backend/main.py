import os
import uuid
import bcrypt
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from utils.crypto import encrypt, decrypt
from utils.stego import encode_image, decode_image

load_dotenv()

app = FastAPI(title="PixelVault API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.post("/encode")
async def encode(
    file: UploadFile = File(...),
    text: str = Form(...),
    password: str = Form(None)
):
    try:
        image_bytes = await file.read()
        encrypted_data = encrypt(text, password)
        prefix = b'E:' if password else b'P:'
        payload = prefix + encrypted_data
        
        encoded_img_io = encode_image(image_bytes, payload)
        
        if supabase:
            # Upload to Supabase Storage
            filename = f"{uuid.uuid4()}_{file.filename}"
            img_bytes_out = encoded_img_io.getvalue()
            
            supabase.storage.from_("images").upload(
                filename,
                img_bytes_out,
                {"content-type": "image/png"}
            )
            
            image_url = supabase.storage.from_("images").get_public_url(filename)
            
            # Hash password for metadata storage (Secure)
            password_hash = None
            if password:
                password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
                
            img_record = supabase.table("images").insert({
                "filename": filename,
                "image_url": image_url
            }).execute()
            
            img_id = img_record.data[0]["id"]
            
            supabase.table("messages").insert({
                "image_id": img_id,
                "encrypted_text": "stored_in_image",
                "password_hash": password_hash
            }).execute()
            
            # Attempt to use Signed URL for extra security (expires in 60s)
            try:
                signed_url_res = supabase.storage.from_("images").create_signed_url(filename, 60)
                # handle both dict or string returns from supabase-py
                secure_url = signed_url_res.get('signedURL') if isinstance(signed_url_res, dict) else signed_url_res
            except Exception:
                secure_url = image_url

            return {
                "message": "Stored successfully",
                "image_url": secure_url or image_url
            }
        else:
            # Local fallback
            return Response(
                content=encoded_img_io.getvalue(),
                media_type="image/png",
                headers={"Content-Disposition": f'attachment; filename="encoded_{file.filename}"'}
            )
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/decode")
async def decode(
    file: UploadFile = File(...),
    password: str = Form(None)
):
    try:
        image_bytes = await file.read()
        payload = decode_image(image_bytes)
        
        prefix = payload[:2]
        data = payload[2:]
        
        if prefix == b'E:' and not password:
            raise ValueError("This image is encrypted! Please provide a password.")
            
        secret_text = decrypt(data, password if prefix == b'E:' else None)
        return {"hidden_text": secret_text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
