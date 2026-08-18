from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserInDB, Token
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.rate_limiting import limiter

router = APIRouter()

@router.post("/register", response_model=UserInDB)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    # Create new user
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Assign default role (VIEWER) to new user
    viewer_role = db.query(Role).filter(Role.name == "VIEWER").first()
    if viewer_role:
        user.roles.append(viewer_role)
        db.commit()
        db.refresh(user)
    return user

@router.post("/login", response_model=Token)
@limiter.limit("1/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token = create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserInDB)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user
