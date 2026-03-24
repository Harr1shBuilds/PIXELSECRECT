from PIL import Image
import io

DELIMITER = b"====EOF===="

def encode_image(image_bytes: bytes, secret_data: bytes) -> io.BytesIO:
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    encoded = img.copy()
    width, height = img.size
    
    data = secret_data + DELIMITER
    
    binary_data = ''.join([format(i, "08b") for i in data])
    data_len = len(binary_data)
    
    data_index = 0
    pixels = encoded.load()
    
    for y in range(height):
        for x in range(width):
            pixel = list(pixels[x, y])
            
            for i in range(3):
                if data_index < data_len:
                    pixel[i] = pixel[i] & ~1 | int(binary_data[data_index])
                    data_index += 1
            
            pixels[x, y] = tuple(pixel)
            
            if data_index >= data_len:
                break
        if data_index >= data_len:
            break
            
    if data_index < data_len:
        raise ValueError("Image is too small to hold the secret data")
        
    out_io = io.BytesIO()
    encoded.save(out_io, format="PNG")
    out_io.seek(0)
    return out_io

def decode_image(image_bytes: bytes) -> bytes:
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    width, height = img.size
    pixels = img.load()
    
    binary_data = ""
    for y in range(height):
        for x in range(width):
            pixel = pixels[x, y]
            for i in range(3):
                binary_data += str(pixel[i] & 1)
                
    all_bytes = [binary_data[i: i+8] for i in range(0, len(binary_data), 8)]
    
    decoded_bytes = bytearray()
    for byte in all_bytes:
        if len(byte) == 8:
            decoded_bytes.append(int(byte, 2))
            if decoded_bytes[-len(DELIMITER):] == DELIMITER:
                return bytes(decoded_bytes[:-len(DELIMITER)])
                
    raise ValueError("No secret data found in image")
