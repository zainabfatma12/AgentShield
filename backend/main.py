from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.trust_engine import calculate_trust_score, make_decision
from backend.database import (
    initialize_database,
    save_transaction,
    get_transactions
)

app = FastAPI(
    title="AgentShield API",
    description="Trust infrastructure for autonomous AI commerce",
    version="0.2.0"
)

initialize_database()

class AnalyzeRequest(BaseModel):
    reputation: float
    successful_transactions: int
    verified: bool
    price: float

class AuthorizeRequest(BaseModel):
    reputation: float
    successful_transactions: int
    verified: bool
    price: float

@app.post("/analyze")
def analyze_service(request: AnalyzeRequest):

    result = calculate_trust_score(
        reputation=request.reputation,
        successful_transactions=request.successful_transactions,
        verified=request.verified,
        price=request.price
    )

    return {
        "service": "AgentShield Analysis",
        "reputation": request.reputation,
        "successful_transactions": request.successful_transactions,
        "verified": request.verified,
        "price": request.price,
        "trust_score": result["trust_score"],
        "risk_level": result["risk_level"],
        "decision": result["decision"],
        "payment_protocol": "x402"
    }

# Allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Basic endpoints
# -------------------------

@app.get("/")
def root():
    return {
        "name": "AgentShield",
        "status": "online",
        "message": "Trust layer for autonomous commerce"
    }

@app.post("/analyze")
def analyze_service(request: AnalyzeRequest):

    result = calculate_trust_score(
        reputation=request.reputation,
        successful_transactions=request.successful_transactions,
        verified=request.verified,
        price=request.price
    )

    return {
        "service": "AgentShield Analysis",
        "reputation": request.reputation,
        "successful_transactions": request.successful_transactions,
        "verified": request.verified,
        "price": request.price,
        "trust_score": result["trust_score"],
        "risk_level": result["risk_level"],
        "decision": result["decision"],
        "payment_protocol": "x402"
    }
@app.post("/authorize")
def authorize_transaction(request: AuthorizeRequest):

    # Step 1: Calculate the provider's trust score
    result = calculate_trust_score(
        reputation=request.reputation,
        successful_transactions=request.successful_transactions,
        verified=request.verified,
        price=request.price
    )

    # Step 2: Ask the AgentShield Decision Engine
    decision = make_decision(result["trust_score"])

    # Step 3: Save the transaction
    transaction_id = save_transaction(
        service="AgentShield Provider",
        trust_score=result["trust_score"],
        risk_level=decision["risk_level"],
        decision=decision["decision"],
        amount=request.price,
        payment_protocol="x402",
        authorized=decision["authorized"],
        reason=decision["reason"]
    )
    
    # Step 4: Return the authorization decision
    return {
        "transaction_id": transaction_id,
        "authorized": decision["authorized"],
        "decision": decision["decision"],
        "risk_level": decision["risk_level"],
        "trust_score": result["trust_score"],
        "reason": decision["reason"],
        "payment_protocol": "x402"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# -------------------------
# Trust Engine
# -------------------------

@app.get("/trust")
def get_trust():

    service = {
        "name": "Demo Weather API",
        "price": 0.001,
        "reputation": 98,
        "successful_transactions": 127,
        "verified": True
    }

    # Calculate trust score
    score = 0

    # Reputation contributes up to 40 points
    score += service["reputation"] * 0.4

    # Transaction history contributes up to 20 points
    transaction_score = min(service["successful_transactions"] / 5, 20)
    score += transaction_score

    # Verification contributes 20 points
    if service["verified"]:
        score += 20

    # Low price contributes 20 points
    if service["price"] <= 0.001:
        score += 20

    score = round(score)

    # Determine risk
    if score >= 80:
        risk_level = "LOW"
        decision = "APPROVE"
    elif score >= 60:
        risk_level = "MEDIUM"
        decision = "REVIEW"
    else:
        risk_level = "HIGH"
        decision = "BLOCK"

    return {
        "service": service["name"],
        "trust_score": score,
        "risk_level": risk_level,
        "reputation": service["reputation"],
        "successful_transactions": service["successful_transactions"],
        "verified": service["verified"],
        "price": service["price"],
        "payment_protocol": "x402",
        "decision": decision
    }
# -------------------------
# Transaction History
# -------------------------

@app.get("/transactions")
def transactions():
    return {
        "transactions": get_transactions()
    }