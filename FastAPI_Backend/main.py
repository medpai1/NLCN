from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, conlist
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import timedelta
import pandas as pd
from model import recommend, output_recommended_recipes
from database import init_db, get_db, User, MealPlan
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    MealPlanCreate, MealPlanUpdate, MealPlanResponse
)

# Load dataset
import os
dataset_path = os.getenv("DATASET_PATH", "../Data/dataset.csv")
try:
    if os.path.exists(dataset_path):
        dataset = pd.read_csv(dataset_path, compression='gzip')
        print(f"Dataset loaded from {dataset_path}")
    else:
        print(f"Warning: Dataset not found at {dataset_path}")
        dataset = None
except Exception as e:
    print(f"Warning: Could not load dataset: {e}")
    dataset = None

app = FastAPI()

# Enable CORS for local frontend and Docker
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

# Also allow all origins in development (you can restrict this in production)
# For now, let's be permissive to ensure it works
cors_origins = ["*"]  # Allow all origins - change this in production!

print(f"CORS allowed origins: {cors_origins}")  # Debug line

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add middleware to log all requests
@app.middleware("http")
async def log_requests(request, call_next):
    # Log request details
    auth_header = request.headers.get("Authorization", "None")
    print(f"DEBUG REQUEST: {request.method} {request.url.path}")
    print(f"DEBUG REQUEST: Authorization header: {auth_header[:50] if auth_header != 'None' else 'None'}...")
    print(f"DEBUG REQUEST: All headers: {dict(request.headers)}")
    
    response = await call_next(request)
    print(f"DEBUG REQUEST: Response status: {response.status_code}")
    return response

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Warning: Database initialization error: {e}")
        # Continue anyway - database might already be initialized


class params(BaseModel):
    n_neighbors:int=5
    return_distance:bool=False

class PredictionIn(BaseModel):
    nutrition_input:conlist(float, min_items=9, max_items=9)
    ingredients:list[str]=[]
    params:Optional[params]


class Recipe(BaseModel):
    Name:str
    CookTime:str
    PrepTime:str
    TotalTime:str
    RecipeIngredientParts:list[str]
    Calories:float
    FatContent:float
    SaturatedFatContent:float
    CholesterolContent:float
    SodiumContent:float
    CarbohydrateContent:float
    FiberContent:float
    SugarContent:float
    ProteinContent:float
    RecipeInstructions:list[str]

class PredictionOut(BaseModel):
    output: Optional[List[Recipe]] = None


@app.get("/")
def home():
    return {"health_check": "OK"}


# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user by username
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.post("/auth/login-json", response_model=Token)
def login_json(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.username)
    ).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


# Meal Plan endpoints
@app.get("/meal-plans", response_model=List[MealPlanResponse])
def get_meal_plans(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get meal plans for the current user"""
    query = db.query(MealPlan).filter(MealPlan.user_id == current_user.id)
    
    if start_date:
        query = query.filter(MealPlan.date >= start_date)
    if end_date:
        query = query.filter(MealPlan.date <= end_date)
    
    return query.order_by(MealPlan.date).all()


@app.get("/meal-plans/{date}", response_model=MealPlanResponse)
def get_meal_plan(
    date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific meal plan by date"""
    meal_plan = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.date == date
    ).first()
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    return meal_plan


@app.post("/meal-plans", response_model=MealPlanResponse, status_code=status.HTTP_201_CREATED)
def create_meal_plan(
    meal_plan_data: MealPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update a meal plan"""
    print(f"DEBUG: create_meal_plan called for user {current_user.id}, date {meal_plan_data.date}")
    # Check if meal plan already exists
    existing = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.date == meal_plan_data.date
    ).first()
    
    if existing:
        # Update existing meal plan
        existing.meals = meal_plan_data.meals
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new meal plan
        db_meal_plan = MealPlan(
            user_id=current_user.id,
            date=meal_plan_data.date,
            meals=meal_plan_data.meals
        )
        db.add(db_meal_plan)
        db.commit()
        db.refresh(db_meal_plan)
        return db_meal_plan


@app.put("/meal-plans/{date}", response_model=MealPlanResponse)
def update_meal_plan(
    date: str,
    meal_plan_data: MealPlanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a meal plan"""
    meal_plan = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.date == date
    ).first()
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    meal_plan.meals = meal_plan_data.meals
    db.commit()
    db.refresh(meal_plan)
    return meal_plan


@app.delete("/meal-plans/{date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal_plan(
    date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a meal plan"""
    meal_plan = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.date == date
    ).first()
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    db.delete(meal_plan)
    db.commit()
    return None


@app.delete("/meal-plans/{date}/meals/{meal_type}", response_model=MealPlanResponse)
def delete_meal_from_plan(
    date: str,
    meal_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a specific meal from a meal plan"""
    meal_plan = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.date == date
    ).first()
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    # Remove the meal type from meals dict
    if meal_type in meal_plan.meals:
        del meal_plan.meals[meal_type]
        db.commit()
        db.refresh(meal_plan)
    
    return meal_plan


# Admin endpoints
@app.get("/admin/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    return db.query(User).all()


@app.post("/admin/users/{user_id}/admin", response_model=UserResponse)
def toggle_admin_status(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle admin status of a user (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return user


# Recipe recommendation endpoint (existing)
class params(BaseModel):
    n_neighbors: int = 5
    return_distance: bool = False


class PredictionIn(BaseModel):
    nutrition_input: conlist(float, min_items=9, max_items=9)
    ingredients: list[str] = []
    params: Optional[params]


class Recipe(BaseModel):
    Name: str
    CookTime: str
    PrepTime: str
    TotalTime: str
    RecipeIngredientParts: list[str]
    Calories: float
    FatContent: float
    SaturatedFatContent: float
    CholesterolContent: float
    SodiumContent: float
    CarbohydrateContent: float
    FiberContent: float
    SugarContent: float
    ProteinContent: float
    RecipeInstructions: list[str]


class PredictionOut(BaseModel):
    output: Optional[List[Recipe]] = None


@app.post("/predict/", response_model=PredictionOut)
def update_item(prediction_input: PredictionIn):
    if dataset is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Dataset not available"
        )
    recommendation_dataframe = recommend(
        dataset,
        prediction_input.nutrition_input,
        prediction_input.ingredients,
        prediction_input.params.dict() if prediction_input.params else {}
    )
    output = output_recommended_recipes(recommendation_dataframe)
    if output is None:
        return {"output": None}
    else:
        return {"output": output}

