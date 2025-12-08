from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
# Patch bcrypt before importing passlib to avoid version check issue
import bcrypt as _bcrypt
if not hasattr(_bcrypt, '__about__'):
    class _FakeAbout:
        __version__ = '4.0.1'
    _bcrypt.__about__ = _FakeAbout()

from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db, User
import os
from typing import Union

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "1a56a90f92e0a45b72cad8d07a6c1a4a")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login-json")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Use bcrypt directly since we're hashing with bcrypt directly
    try:
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        # hashed_password is already a string from the database, encode it to bytes for bcrypt
        hash_bytes = hashed_password.encode('utf-8')
        result = _bcrypt.checkpw(password_bytes, hash_bytes)
        return result
    except Exception as e:
        # Fallback to passlib for backwards compatibility with old hashes
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Use bcrypt directly to avoid passlib compatibility issues
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    salt = _bcrypt.gensalt()
    return _bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    print(f"DEBUG: Creating token with SECRET_KEY length: {len(SECRET_KEY) if SECRET_KEY else 0}")
    print(f"DEBUG: Token data: {to_encode}")
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"DEBUG: Token created. Length: {len(encoded_jwt)}")
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        print("DEBUG: No token provided")
        raise credentials_exception
    
    try:
        # Debug: Print token info (remove in production)
        print(f"DEBUG: Attempting to decode token. Token length: {len(token) if token else 0}")
        print(f"DEBUG: Token preview: {token[:50]}..." if token and len(token) > 50 else f"DEBUG: Token: {token}")
        print(f"DEBUG: SECRET_KEY length: {len(SECRET_KEY) if SECRET_KEY else 0}")
        print(f"DEBUG: SECRET_KEY preview: {SECRET_KEY[:20]}..." if SECRET_KEY and len(SECRET_KEY) > 20 else f"DEBUG: SECRET_KEY: {SECRET_KEY}")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"DEBUG: Token decoded successfully. Payload: {payload}")
        
        user_id: Union[int, str, None] = payload.get("sub")
        if user_id is None:
            print("DEBUG: Token payload missing 'sub' field")
            raise credentials_exception
        # Convert to int if it's a string
        user_id_int = int(user_id) if isinstance(user_id, (str, int)) else None
        if user_id_int is None:
            print(f"DEBUG: Could not convert user_id to int: {user_id}")
            raise credentials_exception
        print(f"DEBUG: User ID extracted: {user_id_int}")
    except JWTError as e:
        print(f"DEBUG: JWT decode error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise credentials_exception
    except ValueError as e:
        print(f"DEBUG: ValueError: {str(e)}")
        import traceback
        traceback.print_exc()
        raise credentials_exception
    except Exception as e:
        print(f"DEBUG: Unexpected error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id_int).first()
    if user is None:
        print(f"DEBUG: User with ID {user_id_int} not found in database")
        # List all users for debugging
        all_users = db.query(User).all()
        print(f"DEBUG: Available user IDs: {[u.id for u in all_users]}")
        raise credentials_exception
    
    print(f"DEBUG: User found: {user.username} (ID: {user.id})")
    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get the current user and verify they are an admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

