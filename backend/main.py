import os

from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.trust_engine import calculate_trust_score, make_decision
from backend.database import (
    initialize_database,
    save_transaction,
    get_transactions
)

# x402 imports
from x402.http import (
    FacilitatorConfig,
    HTTPFacilitatorClient,
    PaymentOption
)
from x402.http.middleware.fastapi import PaymentMiddlewareASGI
from x402.http.types import RouteConfig
from x402.mechanisms.evm.exact import ExactEvmServerScheme
from x402.server import x402ResourceServer


# --------------------------------
# Load environment variables
# --------------------------------

load_dotenv("backend/.env")

PAY_TO = os.getenv("PAY_TO")

if not PAY_TO:
    raise ValueError(
        "PAY_TO is missing. Add your wallet address to backend/.env"
    )

FACILITATOR_URL = os.getenv(
    "FACILITATOR_URL",
    "https://x402.org/facilitator"
)

EVM_NETWORK = "eip155:84532"


# --------------------------------
# Create FastAPI app
# --------------------------------

app = FastAPI(
    title="AgentShield API",
    description="Trust infrastructure for autonomous AI commerce",
    version="0.3.0"
)


# --------------------------------
# Database
# --------------------------------

initialize_database()


# --------------------------------
# x402 configuration
# --------------------------------

facilitator = HTTPFacilitatorClient(
    FacilitatorConfig(
        url=FACILITATOR_URL
    )
)

x402_server = x402ResourceServer(facilitator)

x402_server.register(
    EVM_NETWORK,
    ExactEvmServerScheme()
)


# --------------------------------
# x402 protected routes
# --------------------------------

routes = {
    "POST /analyze": RouteConfig(
        accepts=[
            PaymentOption(
                scheme="exact",
                pay_to=PAY_TO,
                price="$0.001",
                network=EVM_NETWORK
            )
        ],
        mime_type="application/json",
        description="AgentShield trust analysis"
    )
}


app.add_middleware(
    PaymentMiddlewareASGI,
    routes=routes,
    server=x402_server
)


# --------------------------------
# CORS
# --------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# Request models
# --------------------------------

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


# --------------------------------
# Basic endpoint
# --------------------------------

@app.get("/")
def root():
    return {
        "name": "AgentShield",
        "status": "online",
        "message": "Trust layer for autonomous commerce",
        "payment_protocol": "x402"
    }


# --------------------------------
# Analyze endpoint
# --------------------------------

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


# --------------------------------
# Authorize transaction
# --------------------------------

@app.post("/authorize")
def authorize_transaction(request: AuthorizeRequest):

    # Step 1: Calculate trust score

    result = calculate_trust_score(
        reputation=request.reputation,
        successful_transactions=request.successful_transactions,
        verified=request.verified,
        price=request.price
    )

    # Step 2: Ask AgentShield decision engine

    decision = make_decision(
        result["trust_score"]
    )

    # Step 3: Save transaction

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

    # Step 4: Return authorization decision

    return {
        "transaction_id": transaction_id,
        "authorized": decision["authorized"],
        "decision": decision["decision"],
        "risk_level": decision["risk_level"],
        "trust_score": result["trust_score"],
        "reason": decision["reason"],
        "payment_protocol": "x402"
    }


# --------------------------------
# Health check
# --------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# --------------------------------
# Trust Engine demo
# --------------------------------

@app.get("/trust")
def get_trust():

    service = {
        "name": "Demo Weather API",
        "price": 0.001,
        "reputation": 98,
        "successful_transactions": 127,
        "verified": True
    }

    # Start score

    score = 0

    # Reputation: maximum 40 points

    score += service["reputation"] * 0.4

    # Transaction history: maximum 20 points

    transaction_score = min(
        service["successful_transactions"] / 5,
        20
    )

    score += transaction_score

    # Verification: 20 points

    if service["verified"]:
        score += 20

    # Low price: 20 points

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


# --------------------------------
# Transaction history
# --------------------------------

@app.get("/transactions")
def transactions():

    return {
        "transactions": get_transactions()
    }