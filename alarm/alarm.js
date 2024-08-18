import { getAuthToken, validateToken } from "../auth/auth.js";
const PAPERMAN_API_HOST = "https://paperman.kieroth29.xyz";
export async function getRecommendationsAlarm() {
    const { userId } = await chrome.storage.local.get("userId");
    let { authToken } = await chrome.storage.local.get("authToken");
    let publications = [];
    if (userId) {
        const tokenIsValid = await validateToken();
        if (!tokenIsValid) {
            authToken = await getAuthToken();
        }
        const response = await fetch(`${PAPERMAN_API_HOST}/publications`, {
            headers: {
                Authorization: authToken || (await getAuthToken()),
                UserId: userId,
            },
            method: "POST",
        });
        if (response.status === 200) {
            const data = await response.json();
            publications = data.publications;
            orderLatestRecommendations(publications);
        }
        else {
            console.log("Error: ".concat(response.statusText));
        }
    }
    return publications;
}
async function orderLatestRecommendations(requestRecommendations) {
    let { latestRecommendations } = await chrome.storage.local.get("latestRecommendations");
    const recommendationsLength = requestRecommendations.length;
    if (!latestRecommendations) {
        await chrome.storage.local.set({
            latestRecommendations: requestRecommendations,
        });
    }
    if (latestRecommendations.length + recommendationsLength <= 5) {
        const recommendations = [
            ...latestRecommendations,
            ...requestRecommendations,
        ];
        await chrome.storage.local.set({
            latestRecommendations: recommendations,
        });
    }
    else if (recommendationsLength > 0) {
        latestRecommendations.splice(0, recommendationsLength);
        const recommendations = [
            ...latestRecommendations,
            ...requestRecommendations,
        ];
        await chrome.storage.local.set({
            latestRecommendations: recommendations,
        });
    }
}
