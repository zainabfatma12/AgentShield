from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AgentShield API",
    description="Trust infrastructure for autonomous AI commerce",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "AgentShield",
        "status": "online",
        "message": "Trust layer for autonomous commerce"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }