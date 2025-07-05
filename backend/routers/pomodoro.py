from fastapi import APIRouter

router = APIRouter()

@router.get("/pomodoro")
def get_pomodoro():
    return {"time": 1500, "running": False}
