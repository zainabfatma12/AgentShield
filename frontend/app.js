const launchButtons = [
    document.getElementById("launchBtn"),
    document.getElementById("startBtn")
];

launchButtons.forEach((button) => {
    if (button) {
        button.addEventListener("click", () => {
            alert(
                "AgentShield Agent Console is coming online..."
            );
        });
    }
});