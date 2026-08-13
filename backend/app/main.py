from fastapi import FastAPI

app = FastAPI(title="Starchat API", version="0.0.1")

@app.get("/api/")
def root():
    return {"Hello":"World"}

