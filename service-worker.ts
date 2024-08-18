import { getRecommendationsAlarm } from "./alarm/alarm.js";
import { getAuthToken } from "./auth/auth.js";

chrome.runtime.onStartup.addListener(async () => {
  await getAuthToken();
});

function createNotificationId(): string {
  var id = Math.floor((Math.random() * 2) ^ 53) + 1;
  return id.toString();
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "paperman-recommendation") {
    const recommendations = await getRecommendationsAlarm();

    const mapped_recommendations = recommendations.map((recommendation) => {
      const a = {
        title: recommendation.title,
        message: `Authors: ${recommendation.authors
          .map((author) => author.name)
          .toString()}`,
      };
      return a;
    });

    if (recommendations.length > 0) {
      chrome.notifications.create(createNotificationId(), {
        type: "list",
        title: "New batch of recommendations",
        message: "",
        iconUrl: "./static/icons/icon64.png",
        items: mapped_recommendations,
      });
    }
  }
});
