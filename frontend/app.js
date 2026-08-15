const API_URL = "http://192.168.31.55:8000";

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
                    backend.status
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
// AGENTSHIELD TRUST ANALYSIS
// ==========================================

const demoTrustData = {
    service: "Weather Intelligence API",
    trust_score: 94,
    risk_level: "LOW",
    reputation: 97,
    reliability: 92,
    verification: 100,
    price_fairness: 88,
    decision: "APPROVE",
    payment_protocol: "x402"
};


const analyzeButtons = document.querySelectorAll(".analyze-btn");

analyzeButtons.forEach((button) => {

    button.addEventListener("click", () => {

        button.textContent = "Analyzing...";

        setTimeout(() => {

            button.textContent = "Trust: " + demoTrustData.trust_score + "/100";

            alert(
                "AGENTSHIELD TRUST ANALYSIS\n\n" +
                "Service: " + demoTrustData.service + "\n" +
                "Trust Score: " + demoTrustData.trust_score + "/100\n" +
                "Risk: " + demoTrustData.risk_level + "\n" +
                "Reputation: " + demoTrustData.reputation + "%\n" +
                "Reliability: " + demoTrustData.reliability + "%\n" +
                "Verification: " + demoTrustData.verification + "%\n" +
                "Price Fairness: " + demoTrustData.price_fairness + "%\n\n" +
                "Decision: " + demoTrustData.decision + "\n" +
                "Payment: " + demoTrustData.payment_protocol
            );

        }, 800);

    });

});