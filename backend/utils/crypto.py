from cryptography.fernet import Fernet
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

SALT = b"pixelvault_secure_salt"

def get_key(password: str) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=SALT,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key

def encrypt(data: str, password: str | None) -> bytes:
    if not password:
        return data.encode('utf-8')
    key = get_key(password)
    f = Fernet(key)
    return f.encrypt(data.encode('utf-8'))

def decrypt(data: bytes, password: str | None) -> str:
    if not password:
        return data.decode('utf-8')
    key = get_key(password)
    f = Fernet(key)
    try:
        return f.decrypt(data).decode('utf-8')
    except Exception:
        raise ValueError("Invalid password or corrupted data")
