import { getAuthToken, validateToken } from "../auth/auth.js";
import { PAPERMAN_API_HOST } from "../utils/constants.js";
export async function getRecommendations() {
    const recommendations_div = document.getElementById("recommendations-div");
    const { userId } = await chrome.storage.local.get("userId");
    let { authToken } = await chrome.storage.local.get("authToken");
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
            const publications = data.publications;
            for (let i = 0; i < publications.length; i++) {
                const publication = publications[i];
                const authorsNames = publication.authors
                    .map((author) => {
                    return author.name;
                })
                    .toString();
                const elementString = generateElementString(publication, authorsNames);
                const parser = new DOMParser();
                const doc = parser.parseFromString(elementString, "text/html");
                const element = doc.body.firstChild;
                recommendations_div?.appendChild(element);
            }
        }
        else {
            console.log("Error: ".concat(response.statusText));
        }
    }
}
function generateElementString(publication, authorsNames) {
    return `
    <div class="recommmendation" data-publication-url=${publication.url}>
        <h1 class="recommendation-title">${publication.title}</h1>
        
        <h2>Authors:</h2>
        <h3>${authorsNames}</h3>

        <h3><a href="${publication.url}" target="_blank">URL</a></h3>
    </div>
    `;
}
