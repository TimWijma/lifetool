from pydantic import BaseModel

class Todo(BaseModel):
    id: int
    text: str
    done: bool

class Pomodoro(BaseModel):
    id: int
    time: int
    running: bool
