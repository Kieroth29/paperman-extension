import { PAPERMAN_API_HOST } from "../utils/constants.js";
export async function getAuthToken() {
    const { userId } = await chrome.storage.local.get("userId");
    const response = await fetch(`${PAPERMAN_API_HOST}/auth/generate_token`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
    });
    if (response.status === 200) {
        const data = await response.json();
        const authToken = data.token;
        await chrome.storage.local.set({ authToken: authToken });
        return authToken;
    }
    else {
        console.log("Error: ".concat(response.statusText));
    }
}
export async function validateToken() {
    const { userId } = await chrome.storage.local.get("userId");
    let { authToken } = await chrome.storage.local.get("authToken");
    if (!authToken) {
        return false;
    }
    const response = await fetch(`${PAPERMAN_API_HOST}/auth/validate_token`, {
        method: "POST",
        body: JSON.stringify({ user: userId, token: authToken }),
    });
    if (response.status === 200) {
        const data = await response.json();
        return data.valid;
    }
    else {
        console.log("Error: ".concat(response.statusText));
    }
}
