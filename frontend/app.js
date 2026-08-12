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