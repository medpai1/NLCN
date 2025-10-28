from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, conlist
from typing import List, Optional
import pandas as pd
from model import recommend, output_recommended_recipes
from datetime import date, datetime
from pathlib import Path
import json


dataset = pd.read_csv('../Data/dataset.csv', compression='gzip')
# ensure an ID column for referencing recipes
if 'id' not in dataset.columns:
    dataset = dataset.reset_index().rename(columns={'index': 'id'})

app = FastAPI()

# CORS for web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# simple file-backed storage for planner and activities
STORAGE_DIR = Path(__file__).parent / 'storage'
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
PLANNER_PATH = STORAGE_DIR / 'planner.json'
ACTIVITIES_PATH = STORAGE_DIR / 'activities.json'

def _read_json(path: Path, default):
    if path.exists():
        try:
            return json.loads(path.read_text(encoding='utf-8'))
        except Exception:
            return default
    return default

def _write_json(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')


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


class RecipeQuery(BaseModel):
    search: Optional[str] = None
    ingredient: Optional[str] = None
    min_calories: Optional[float] = None
    max_calories: Optional[float] = None


class PlannerEntry(BaseModel):
    date: date
    meal: str  # breakfast, lunch, dinner, snack
    recipe_id: int


class Activity(BaseModel):
    timestamp: datetime
    type: str  # recipe_view, planner_add, planner_remove, search
    meta: dict


@app.get("/")
def home():
    return {"health_check": "OK"}


@app.post("/predict/",response_model=PredictionOut)
def update_item(prediction_input:PredictionIn):
    recommendation_dataframe=recommend(dataset,prediction_input.nutrition_input,prediction_input.ingredients,prediction_input.params.dict())
    output=output_recommended_recipes(recommendation_dataframe)
    if output is None:
        return {"output":None}
    else:
        return {"output":output}


@app.get('/recipes')
def list_recipes(search: Optional[str] = None,
                 ingredient: Optional[str] = None,
                 min_calories: Optional[float] = None,
                 max_calories: Optional[float] = None,
                 limit: int = 100,
                 offset: int = 0):
    df = dataset.copy()
    if search:
        df = df[df['Name'].str.contains(search, case=False, na=False)]
    if ingredient:
        df = df[df['RecipeIngredientParts'].str.contains(ingredient, case=False, na=False)]
    if min_calories is not None:
        df = df[df['Calories'] >= min_calories]
    if max_calories is not None:
        df = df[df['Calories'] <= max_calories]
    total = len(df)
    df = df.sort_values('Calories').iloc[offset:offset+limit]
    records = df.to_dict('records')
    return {"total": total, "items": records}


@app.get('/recipes/{recipe_id}')
def get_recipe(recipe_id: int):
    df = dataset[dataset['id'] == recipe_id]
    if df.empty:
        return {"item": None}
    item = df.iloc[0].to_dict()
    return {"item": item}


@app.get('/planner')
def get_planner(start: Optional[date] = None, end: Optional[date] = None):
    entries = _read_json(PLANNER_PATH, [])
    if start:
        entries = [e for e in entries if e['date'] >= start.isoformat()]
    if end:
        entries = [e for e in entries if e['date'] <= end.isoformat()]
    return {"items": entries}


@app.post('/planner')
def add_planner(entry: PlannerEntry):
    entries = _read_json(PLANNER_PATH, [])
    entries.append({"date": entry.date.isoformat(), "meal": entry.meal, "recipe_id": entry.recipe_id})
    _write_json(PLANNER_PATH, entries)
    # log activity
    activities = _read_json(ACTIVITIES_PATH, [])
    activities.append({
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "type": "planner_add",
        "meta": {"date": entry.date.isoformat(), "meal": entry.meal, "recipe_id": entry.recipe_id}
    })
    _write_json(ACTIVITIES_PATH, activities)
    return {"ok": True}


@app.delete('/planner')
def remove_planner(date_: date, meal: str, recipe_id: int):
    entries = _read_json(PLANNER_PATH, [])
    new_entries = [e for e in entries if not (e['date'] == date_.isoformat() and e['meal'] == meal and e['recipe_id'] == recipe_id)]
    _write_json(PLANNER_PATH, new_entries)
    # log activity
    activities = _read_json(ACTIVITIES_PATH, [])
    activities.append({
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "type": "planner_remove",
        "meta": {"date": date_.isoformat(), "meal": meal, "recipe_id": recipe_id}
    })
    _write_json(ACTIVITIES_PATH, activities)
    return {"ok": True}


@app.get('/activities')
def get_activities(limit: int = 200):
    activities = list(reversed(_read_json(ACTIVITIES_PATH, [])))
    return {"items": activities[:limit]}


@app.post('/activities')
def add_activity(activity: Activity):
    activities = _read_json(ACTIVITIES_PATH, [])
    activities.append({
        "timestamp": activity.timestamp.isoformat(),
        "type": activity.type,
        "meta": activity.meta,
    })
    _write_json(ACTIVITIES_PATH, activities)
    return {"ok": True}

