const BASE_URL = "http://localhost:5000/api/admin";   // change to full URL in production if needed: "https://yourdomain.com/api/admin"

function getToken() {
    return localStorage.getItem("adminToken");
}

function setAuth(token, email) {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminEmail", email);
}

function clearAuth() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
}

async function api(endpoint, options = {}) {
    const token = getToken();

    if (!token && !["/login", "/register"].includes(endpoint)) {
        window.location.href = "login.html";
        return null;
    }

    const headers = {
        "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let body = options.body;
    if (body && typeof body === "object") body = JSON.stringify(body);

    try {
        const res = await fetch(BASE_URL + endpoint, {
            ...options,
            headers,
            body,
        });

        if (res.status === 401 || res.status === 403) {
            clearAuth();
            alert("Session expired or not authorized. Please login again.");
            window.location.href = "login.html";
            return null;
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.msg || "Request failed");
        }

        return data;
    } catch (err) {
        console.error(endpoint, err);
        alert(err.message || "Network / server error");
        throw err;
    }
}

// Quick check – call on every protected page load
function requireAuth() {
    if (!getToken()) {
        window.location.href = "login.html";
    }
}