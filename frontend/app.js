// ==========================================
// AGENTSHIELD FRONTEND
// ==========================================

// Zara's backend API
const API_URL = "http://192.168.31.55:8000";
// ==========================================
// DEMO MODE
// ==========================================

// Keep this TRUE while Zara's laptop is not connected.
// Change to FALSE later when using the real backend.
const USE_LOCAL_MODE = true;
// ==========================================
// TRANSACTION HISTORY STATE
// ==========================================

const transactions = [];


// ==========================================
// BACKEND HEALTH CHECK
// ==========================================

async function checkBackend() {

    try {

        const response = await fetch(`${API_URL}/health`);

        if (!response.ok) {
            throw new Error("Backend request failed");
        }

        const data = await response.json();

        console.log("AgentShield backend:", data);

        return data;

    } catch (error) {

        console.error("Backend connection failed:", error);

        return null;
    }
}


// ==========================================
// LAUNCH AGENT BUTTONS
// ==========================================

const launchButtons = [
    document.getElementById("launchBtn"),
    document.getElementById("startBtn")
];


launchButtons.forEach((button) => {

    if (button) {

        button.addEventListener("click", async () => {

            button.textContent = "Connecting...";

            const backend = await checkBackend();

            if (backend) {

                button.textContent = "Agent Online ✓";

                alert(
                    "AgentShield connected successfully!\n\n" +
                    "Backend status: " +
                    (backend.status || "Online")
                );

            } else {

                button.textContent = "Connection Failed";

                alert(
                    "AgentShield could not connect to the backend."
                );

            }

        });

    }

});


// ==========================================
// TRUST ANALYSIS MODAL
// ==========================================

const trustModal =
    document.getElementById("trustModal");

const closeTrustModal =
    document.getElementById("closeTrustModal");


// ==========================================
// CLOSE MODAL
// ==========================================

if (closeTrustModal) {

    closeTrustModal.addEventListener("click", () => {

        if (trustModal) {
            trustModal.classList.remove("active");
        }

    });

}


// ==========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ==========================================

if (trustModal) {

    trustModal.addEventListener("click", (event) => {

        if (event.target === trustModal) {

            trustModal.classList.remove("active");

        }

    });

}


// ==========================================
// TRUST ANALYSIS BUTTONS
// ==========================================
// ==========================================
// LOCAL TRUST ANALYSIS
// ==========================================

function calculateLocalTrust(serviceData) {

    let score = 0;

    // Reputation: maximum 40 points
    score += serviceData.reputation * 0.4;

    // Successful transactions: maximum 20 points
    score += Math.min(
        serviceData.successful_transactions / 5,
        20
    );

    // Verification: 20 points
    if (serviceData.verified) {
        score += 20;
    }

    // Price safety: 20 points
    if (serviceData.price <= 0.001) {
        score += 20;
    }

    score = Math.round(score);

    let riskLevel;
    let decision;

    if (score >= 80) {
        riskLevel = "LOW";
        decision = "APPROVE";
    } else if (score >= 60) {
        riskLevel = "MEDIUM";
        decision = "REVIEW";
    } else {
        riskLevel = "HIGH";
        decision = "BLOCK";
    }

    return {
        service: serviceData.service,
        reputation: serviceData.reputation,
        successful_transactions:
            serviceData.successful_transactions,
        verified: serviceData.verified,
        price: serviceData.price,
        trust_score: score,
        risk_level: riskLevel,
        decision: decision,
        payment_protocol: "x402"
    };
}
const analyzeButtons =
    document.querySelectorAll(".analyze-btn");


analyzeButtons.forEach((button) => {

    button.addEventListener("click", async () => {

        button.textContent = "Analyzing...";
        button.disabled = true;


        // ==========================================
        // SERVICE DATA
        // ==========================================

        const serviceData = {

            service: "Weather Intelligence API",

            reputation: 95,

            reliability: 92,

            successful_transactions: 90,

            verified: true,

            price: 10

        };


        try {

            console.log(
                "Sending data to AgentShield backend:",
                serviceData
            );


            // ==========================================
            // CALL BACKEND
            // ==========================================

            // ==========================================
// ANALYSIS SOURCE
// ==========================================

let result;

if (USE_LOCAL_MODE) {

    console.log(
        "AgentShield: using local trust engine."
    );

    // Local demo — no network required
    await new Promise(resolve =>
        setTimeout(resolve, 700)
    );

    result = calculateLocalTrust(serviceData);

} else {

    console.log(
        "AgentShield: using Zara's backend."
    );

    const response = await fetch(
        `${API_URL}/analyze`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(serviceData)
        }
    );

    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            "Backend error:",
            errorText
        );

        throw new Error(
            `Backend returned ${response.status}`
        );
    }

    result = await response.json();
}

console.log(
    "AgentShield Trust Result:",
    result
);

            console.log(
                "AgentShield Trust Result:",
                result
            );


            // ==========================================
            // EXTRACT RESULTS
            // ==========================================

            const reputation =
                result.reputation ?? serviceData.reputation;

            const reliability =
                serviceData.reliability;

            const verification =
                result.verified ? 100 : 0;

            const transactionHistory =
                result.successful_transactions ??
                serviceData.successful_transactions;

            const price =
                result.price ?? serviceData.price;


            // ==========================================
            // UPDATE SERVICE NAME
            // ==========================================

            const analysisService =
                document.getElementById(
                    "analysisService"
                );

            if (analysisService) {

                analysisService.textContent =
                    serviceData.service;

            }


            // ==========================================
            // UPDATE TRUST SCORE
            // ==========================================

            const analysisScore =
                document.getElementById(
                    "analysisScore"
                );

            if (analysisScore) {

                analysisScore.textContent =
                    result.trust_score;

            }


            // ==========================================
            // UPDATE RISK LEVEL
            // ==========================================

            const analysisRisk =
                document.getElementById(
                    "analysisRisk"
                );

            if (analysisRisk) {

                analysisRisk.textContent =
                    result.risk_level + " RISK";

            }


            // ==========================================
            // UPDATE REPUTATION
            // ==========================================

            const analysisReputation =
                document.getElementById(
                    "analysisReputation"
                );

            if (analysisReputation) {

                analysisReputation.textContent =
                    reputation + "%";

            }


            // ==========================================
            // UPDATE RELIABILITY
            // ==========================================

            const analysisReliability =
                document.getElementById(
                    "analysisReliability"
                );

            if (analysisReliability) {

                analysisReliability.textContent =
                    reliability + "%";

            }


            // ==========================================
            // UPDATE VERIFICATION
            // ==========================================

            const analysisVerification =
                document.getElementById(
                    "analysisVerification"
                );

            if (analysisVerification) {

                analysisVerification.textContent =
                    verification + "%";

            }


            // ==========================================
            // UPDATE PRICE
            // ==========================================

            const analysisPrice =
                document.getElementById(
                    "analysisPrice"
                );

            if (analysisPrice) {

                analysisPrice.textContent =
                    "$" + price;

            }


            // ==========================================
            // UPDATE TRANSACTIONS
            // ==========================================

            const analysisTransactions =
                document.getElementById(
                    "analysisTransactions"
                );

            if (analysisTransactions) {

                analysisTransactions.textContent =
                    transactionHistory + "%";

            }


            // ==========================================
            // PROGRESS BARS
            // ==========================================

            const reputationBar =
                document.getElementById(
                    "reputationBar"
                );

            if (reputationBar) {

                reputationBar.style.width =
                    reputation + "%";

            }


            const reliabilityBar =
                document.getElementById(
                    "reliabilityBar"
                );

            if (reliabilityBar) {

                reliabilityBar.style.width =
                    reliability + "%";

            }


            const verificationBar =
                document.getElementById(
                    "verificationBar"
                );

            if (verificationBar) {

                verificationBar.style.width =
                    verification + "%";

            }


            const priceBar =
                document.getElementById(
                    "priceBar"
                );

            if (priceBar) {

                // Price is not a percentage.
                // Use a visual value for the UI.
                priceBar.style.width = "70%";

            }


            const transactionBar =
                document.getElementById(
                    "transactionBar"
                );

            if (transactionBar) {

                transactionBar.style.width =
                    transactionHistory + "%";

            }


            // ==========================================
            // UPDATE DECISION
            // ==========================================

            const analysisDecision =
                document.getElementById(
                    "analysisDecision"
                );

            if (analysisDecision) {

                analysisDecision.textContent =
                    result.decision;

            }


            // ==========================================
            // UPDATE PAYMENT PROTOCOL
            // ==========================================

            const paymentProtocol =
                document.getElementById(
                    "paymentProtocol"
                );

            if (paymentProtocol) {

                paymentProtocol.textContent =
                    result.payment_protocol || "x402";

            }


            // ==========================================
            // SHOW TRUST MODAL
            // ==========================================

            if (trustModal) {

                trustModal.classList.add("active");

            }


            // ==========================================
            // UPDATE BUTTON
            // ==========================================

            button.textContent =
                "Trust: " +
                result.trust_score +
                "/100";


            // ==========================================
            // SUCCESS MESSAGE IN CONSOLE
            // ==========================================

            console.log(
                "================================"
            );

            console.log(
                "AgentShield Analysis Complete"
            );

            console.log(
                "Trust Score:",
                result.trust_score
            );

            console.log(
                "Risk Level:",
                result.risk_level
            );

            console.log(
                "Decision:",
                result.decision
            );

            console.log(
                "Payment Protocol:",
                result.payment_protocol
            );

            console.log(
                "================================"
            );


        } catch (error) {

            // ==========================================
            // ERROR HANDLING
            // ==========================================

            console.error(
                "AgentShield analysis error:",
                error
            );


            button.textContent =
                "Analysis Failed";


            alert(
                "AgentShield Trust Analysis Failed.\n\n" +
                "Please check that the backend is running at:\n" +
                API_URL
            );


        } finally {

            button.disabled = false;

        }

    });

});


// ==========================================
// PHASE 3 — LOCAL TRANSACTION AUTHORIZATION
// ==========================================

// Demo provider used while Zara's backend is on another network
const demoProvider = {
    reputation: 98,
    successful_transactions: 127,
    verified: true,
    price: 0.001
};
const reviewProvider = {
    reputation: 74,
    successful_transactions: 70,
    verified: true,
    price: 0.005
};

// ==========================================
// LOCAL AUTHORIZATION FUNCTION
// ==========================================

async function authorizeTransaction(providerData) {

    console.log("AgentShield local authorization:", providerData);

    // Simulate a short backend processing delay
    await new Promise(resolve => setTimeout(resolve, 700));

    // Demo trust calculation
    let score = 0;

    // Reputation: maximum 40 points
    score += providerData.reputation * 0.4;

    // Successful transactions: maximum 20 points
    score += Math.min(
        providerData.successful_transactions / 5,
        20
    );

    // Verification: 20 points
    if (providerData.verified) {
        score += 20;
    }

    // Price: 20 points
    if (providerData.price <= 0.001) {
        score += 20;
    }

    score = Math.round(score);


    // Determine decision
    let riskLevel;
    let decision;
    let authorized;

    if (score >= 80) {

        riskLevel = "LOW";
        decision = "APPROVE";
        authorized = true;

    } else if (score >= 60) {

        riskLevel = "MEDIUM";
        decision = "REVIEW";
        authorized = false;

    } else {

        riskLevel = "HIGH";
        decision = "BLOCK";
        authorized = false;
    }


    return {
        trust_score: score,
        risk_level: riskLevel,
        decision: decision,
        authorized: authorized,
        reason:
            decision === "APPROVE"
                ? "Provider passed AgentShield trust verification."
                : "Provider requires additional verification."
    };
}


// ==========================================
// x402 PAYMENT BUTTON
// ==========================================

const proceedPaymentButton =
    document.getElementById("proceedPaymentBtn");

const authorizationResult =
    document.getElementById("authorizationResult");


if (proceedPaymentButton) {

    proceedPaymentButton.addEventListener(
        "click",
        async () => {

            // Loading state
            proceedPaymentButton.disabled = true;

            proceedPaymentButton.textContent =
                "Checking AgentShield...";


            if (authorizationResult) {

                authorizationResult.innerHTML = `
                    <div>
                        🛡️ AgentShield is verifying
                        this transaction...
                    </div>
                `;
            }


            // Run local authorization
           const result = authorizeTransactionLocal(demoProvider);

            // ==========================================
            // APPROVED
            // ==========================================

            if (
                result.decision === "APPROVE" &&
                result.authorized === true
            ) {

                if (authorizationResult) {

                    authorizationResult.innerHTML = `
                        <div>
                            🟢 <strong>TRANSACTION AUTHORIZED</strong>
                            <br><br>

                            Trust Score:
                            ${result.trust_score}/100

                            <br>

                            Risk:
                            ${result.risk_level}

                            <br>

                            Decision:
                            ${result.decision}

                            <br><br>

                            <strong>
                                x402 payment may proceed.
                            </strong>

                            <br><br>

                            <small>
                                ${result.reason}
                            </small>
                        </div>
                    `;
                }


                proceedPaymentButton.textContent =
                    "✓ x402 Payment Authorized";

                proceedPaymentButton.disabled = true;
                addTransaction({
    service: "Weather Intelligence API",
    protocol: "x402 payment",
    trustScore: result.trust_score,
    risk: result.risk_level,
    amount: demoProvider.price,
    status: "APPROVED"
});
return;


// ==========================================
// RECORD APPROVED TRANSACTION
// ==========================================

addTransaction({
    service: "Weather Intelligence API",
    protocol: "x402 payment",
    trustScore: result.trust_score,
    risk: result.risk_level,
    amount: demoProvider.price,
    status: "APPROVED"
});


return;

                return;
            }


            // ==========================================
            // REVIEW
            // ==========================================

            if (result.decision === "REVIEW") {

                if (authorizationResult) {

                    authorizationResult.innerHTML = `
                        <div>
                            🟡 <strong>TRANSACTION PAUSED</strong>
                            <br><br>

                            Trust Score:
                            ${result.trust_score}/100

                            <br>

                            Risk:
                            ${result.risk_level}

                            <br>

                            Decision:
                            REVIEW

                            <br><br>

                            Additional verification is required.

                            <br><br>

                            x402 payment has
                            <strong>NOT</strong> been authorized.
                        </div>
                    `;
                }


                proceedPaymentButton.textContent =
                    "Authorization Required";

                proceedPaymentButton.disabled = true;

                return;
            }


            // ==========================================
            // BLOCKED
            // ==========================================

            if (result.decision === "BLOCK") {

                if (authorizationResult) {

                    authorizationResult.innerHTML = `
                        <div>
                            🔴 <strong>TRANSACTION BLOCKED</strong>
                            <br><br>

                            Trust Score:
                            ${result.trust_score}/100

                            <br>

                            Risk:
                            ${result.risk_level}

                            <br>

                            Decision:
                            BLOCK

                            <br><br>

                            x402 payment has been prevented.

                            <br><br>

                            <small>
                                ${result.reason}
                            </small>
                        </div>
                    `;
                }


                proceedPaymentButton.textContent =
                    "✕ Payment Blocked";

                proceedPaymentButton.disabled = true;

                return;
            }

        }
    );

}


// ==========================================
// FRONTEND STATUS
// ==========================================

console.log(
    "AgentShield frontend loaded."
);

console.log(
    "Phase 3 local authorization mode enabled."
);
// ==========================================
// PHASE 4 — TRANSACTION HISTORY
// ==========================================

function addTransaction(transaction) {
    transactions.push(transaction);

    const transactionList =
        document.getElementById("transactionList");

    if (!transactionList) {
        console.error("Transaction history container not found.");
        return;
    }

    let statusClass = "approved";
    let icon = "✓";

    if (transaction.status === "REVIEW") {
        statusClass = "review";
        icon = "!";
    }

    if (transaction.status === "BLOCKED") {
        statusClass = "blocked";
        icon = "×";
    }

    const transactionCard =
        document.createElement("div");

    transactionCard.className =
        `transaction-card ${statusClass}`;

    transactionCard.innerHTML = `
        <div class="transaction-icon">
            ${icon}
        </div>

        <div class="transaction-info">
            <h3>${transaction.service}</h3>
            <p>${transaction.protocol}</p>
        </div>

        <div class="transaction-trust">
            <strong>${transaction.trustScore}/100</strong>
            <span>${transaction.risk} RISK</span>
        </div>

        <div class="transaction-amount">
            <strong>$${transaction.amount}</strong>
            <span>${transaction.status}</span>
        </div>
    `;

    transactionList.prepend(transactionCard);

    console.log(
        "AgentShield transaction recorded:",
        transaction
    );

    // Update dashboard statistics
    updateDashboardStats();
}


// ==========================================
// PHASE 4.4 — DASHBOARD STATISTICS
// ==========================================

function updateDashboardStats() {

    const totalElement =
        document.getElementById("totalTransactions");

    const approvedElement =
        document.getElementById("approvedTransactions");

    const reviewElement =
        document.getElementById("reviewTransactions");

    const blockedElement =
        document.getElementById("blockedTransactions");


    if (totalElement) {

        totalElement.textContent =
            transactions.length;

    }


    if (approvedElement) {

        approvedElement.textContent =
            transactions.filter(
                t => t.status === "APPROVED"
            ).length;

    }


    if (reviewElement) {

        reviewElement.textContent =
            transactions.filter(
                t => t.status === "REVIEW"
            ).length;

    }


    if (blockedElement) {

        blockedElement.textContent =
            transactions.filter(
                t => t.status === "BLOCKED"
            ).length;

    }
}
// ==========================================
// PHASE 5 — LOCAL AUTHORIZATION ENGINE
// ==========================================

function authorizeTransactionLocal(providerData) {

    console.log(
        "AgentShield local authorization:",
        providerData
    );

    // Calculate a simple local trust score
    let score = 0;

    // Reputation: maximum 40 points
    score += providerData.reputation * 0.4;

    // Successful transactions: maximum 20 points
    score += Math.min(
        providerData.successful_transactions / 5,
        20
    );

    // Verification: 20 points
    if (providerData.verified === true) {
        score += 20;
    }

    // Price: 20 points
    if (providerData.price <= 0.001) {
        score += 20;
    }

    score = Math.round(score);


    // Determine risk and decision
    let riskLevel;
    let decision;
    let authorized;


    if (score >= 80) {

        riskLevel = "LOW";
        decision = "APPROVE";
        authorized = true;

    } else if (score >= 60) {

        riskLevel = "MEDIUM";
        decision = "REVIEW";
        authorized = false;

    } else {

        riskLevel = "HIGH";
        decision = "BLOCK";
        authorized = false;
    }


    const result = {

        authorized: authorized,

        trust_score: score,

        risk_level: riskLevel,

        decision: decision,

        reason:
            authorized
                ? "Provider passed AgentShield trust verification."
                : "Provider requires additional verification.",

        payment_protocol: "x402"
    };


    console.log(
        "AgentShield local authorization result:",
        result
    );


    return result;
}
// ==========================================
// PHASE 5 — x402 PAYMENT BUTTON
// ==========================================

const proceedPaymentBtn =
    document.getElementById("proceedPaymentBtn");

if (proceedPaymentBtn) {

    proceedPaymentBtn.addEventListener("click", async () => {

        console.log("x402 payment button clicked.");

        proceedPaymentBtn.disabled = true;
        proceedPaymentBtn.textContent =
            "Checking AgentShield...";

        const authorizationResult =
            document.getElementById("authorizationResult");

        if (authorizationResult) {
            authorizationResult.innerHTML = `
                <div>
                    🛡️ AgentShield is verifying this transaction...
                </div>
            `;
        }

        // Local demo authorization
        const result = authorizeTransactionLocal(demoProvider);

        if (!result) {

            proceedPaymentBtn.disabled = false;
            proceedPaymentBtn.textContent =
                "Proceed with x402 Payment →";

            if (authorizationResult) {
                authorizationResult.innerHTML = `
                    <div>
                        ⚠️ Transaction could not be authorized.
                    </div>
                `;
            }

            return;
        }

        // APPROVED
        if (
            result.decision === "APPROVE" &&
            result.authorized === true
        ) {

            if (authorizationResult) {
                authorizationResult.innerHTML = `
                    <div>
                        🟢 <strong>TRANSACTION AUTHORIZED</strong>
                        <br><br>
                        Trust Score: ${result.trust_score}/100
                        <br>
                        Risk: ${result.risk_level}
                        <br>
                        Decision: ${result.decision}
                        <br><br>
                        x402 payment may proceed.
                    </div>
                `;
            }

            proceedPaymentBtn.textContent =
                "✓ x402 Payment Authorized";

            addTransaction({
                service: "Weather Intelligence API",
                protocol: "x402 payment",
                trustScore: result.trust_score,
                risk: result.risk_level,
                amount: demoProvider.price,
                status: "APPROVED"
            });

            return;
        }

        // REVIEW
        if (result.decision === "REVIEW") {

            proceedPaymentBtn.disabled = false;
            proceedPaymentBtn.textContent =
                "Authorization Required";

            if (authorizationResult) {
                authorizationResult.innerHTML = `
                    <div>
                        🟡 <strong>TRANSACTION PAUSED</strong>
                        <br><br>
                        Trust Score: ${result.trust_score}/100
                        <br>
                        Risk: ${result.risk_level}
                        <br>
                        Decision: REVIEW
                        <br><br>
                        x402 payment has NOT been authorized.
                    </div>
                `;
            }

            return;
        }

        // BLOCKED
        if (result.decision === "BLOCK") {

            proceedPaymentBtn.textContent =
                "✕ Payment Blocked";

            if (authorizationResult) {
                authorizationResult.innerHTML = `
                    <div>
                        🔴 <strong>TRANSACTION BLOCKED</strong>
                        <br><br>
                        Trust Score: ${result.trust_score}/100
                        <br>
                        Risk: ${result.risk_level}
                        <br>
                        Decision: BLOCK
                        <br><br>
                        x402 payment has been prevented.
                    </div>
                `;
            }

            return;
        }
    });

    console.log(
        "AgentShield x402 payment button ready."
    );
}