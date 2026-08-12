from fastapi import FastAPI

app = FastAPI(
    title="AgentShield API",
    description="Trust infrastructure for autonomous AI commerce",
    version="0.1.0"
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