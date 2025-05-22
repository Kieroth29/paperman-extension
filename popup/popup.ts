import { getAuthToken, validateToken } from "../auth/auth.js";
import { Author } from "../types/recommendation";
import { PAPERMAN_API_HOST } from "../utils/constants.js";

const recommendationsDiv = <HTMLButtonElement>(
  document.getElementById("latest-recommendations")
);

chrome.storage.local.get(["latestRecommendations"]).then(async (result) => {
  const recommendations = result.latestRecommendations;

  if (recommendations) {
    for (let i = 0; i < recommendations.length; i++) {
      let recommendation = recommendations[i];
      let authors = <string>recommendation.authors
        .map((author: Author) => {
          return author.name;
        })
        .toString();

      const recommendationKey = recommendation.url;

      let ratings =
        (await chrome.storage.local.get(["recommendationRatings"]))
          .recommendationRatings || {};

      const activeUrls = recommendations.map((rec: any) => rec.url);
      for (const key in ratings) {
        if (!activeUrls.includes(key)) {
          delete ratings[key];
        }
      }
      await chrome.storage.local.set({ recommendationRatings: ratings });

      const currentRating = ratings[recommendationKey] || 0;

      let starsHtml =
        '<div class="star-rating" data-url="' + recommendationKey + '">';
      for (let star = 1; star <= 5; star++) {
        starsHtml += `<span class="star" data-star="${star}" style="cursor:pointer; color:${
          star <= currentRating ? "#FFD700" : "#ccc"
        }">&#9733;</span>`;
      }
      starsHtml += "</div>";

      const elementString = `
        <div class="recommmendation" data-article-url="${recommendation.url}">
        <h3 class="recommendation-title"><a href="${recommendation.url}" target="_blank">${recommendation.title}</a></h3>
        <h4>Authors:</h4>
        <h5>${authors}</h5>
        ${starsHtml}
        </div>
        `;

      setTimeout(async () => {
        const starContainer = recommendationsDiv.querySelector(
          `.star-rating[data-url="${recommendationKey}"]`
        );

        const { userId } = await chrome.storage.local.get(["userId"]);
        let { authToken } = await chrome.storage.local.get("authToken");

        const tokenIsValid = await validateToken();

        if (!tokenIsValid) {
          authToken = await getAuthToken();
        }

        if (starContainer) {
          const stars =
            starContainer.querySelectorAll<HTMLSpanElement>(".star");
          stars.forEach((starElem) => {
            starElem.addEventListener("click", async (event) => {
              const selectedStar = Number(starElem.getAttribute("data-star"));

              let ratings =
                (await chrome.storage.local.get(["recommendationRatings"]))
                  .recommendationRatings || {};

              ratings[recommendationKey] = selectedStar;

              await chrome.storage.local.set({
                recommendationRatings: ratings,
              });

              stars.forEach((s, idx) => {
                s.style.color = idx < selectedStar ? "#FFD700" : "#ccc";
              });

              fetch(`${PAPERMAN_API_HOST}/publications/rate`, {
                method: "POST",
                headers: {
                  Authorization: authToken || (await getAuthToken()),
                  UserId: userId,
                },
                body: JSON.stringify({
                  url: recommendationKey,
                  rating: selectedStar,
                }),
              }).catch((e) => {
                console.error("Failed to save rating to backend", e);
              });
            });
          });
        }
      }, 0);

      const parser = new DOMParser();
      const doc = parser.parseFromString(elementString, "text/html");
      const element = <Node>doc.body.firstChild;
      recommendationsDiv.appendChild(element);
    }
  }
});
