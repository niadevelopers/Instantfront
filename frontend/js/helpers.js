function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-KE", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function showAlert(type, message, timeout = 5000) {
    const div = document.createElement("div");
    div.className = `alert alert-${type}`;
    div.textContent = message;
    document.body.prepend(div);
    if (timeout) setTimeout(() => div.remove(), timeout);
}

function loading(btn, isLoading) {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Loading..." : btn.dataset.originalText || btn.textContent;
}