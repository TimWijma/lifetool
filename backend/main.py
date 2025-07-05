
from fastapi import FastAPI
from routers import todos, pomodoro

app = FastAPI()

app.include_router(todos.router)
app.include_router(pomodoro.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
