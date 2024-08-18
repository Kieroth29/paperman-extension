import { Author } from "../types/recommendation";

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

      const elementString = `
            <div class="recommmendation" data-article-url=${recommendation.url}>
                <h3 class="recommendation-title"><a href="${recommendation.url}" target="_blank">${recommendation.title}</a></h3>
                
                <h4>Authors:</h4>
                <h5>${authors}</h5>
            </div>
            `;

      const parser = new DOMParser();
      const doc = parser.parseFromString(elementString, "text/html");
      const element = <Node>doc.body.firstChild;
      recommendationsDiv.appendChild(element);
    }
  }
});
