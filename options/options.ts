import { getAuthToken } from "../auth/auth.js";
import { PAPERMAN_API_HOST } from "../utils/constants.js";

const intervalButton = <HTMLButtonElement>(
  document.getElementById("change-interval-btn")
);
const sourcesButton = <HTMLButtonElement>document.getElementById("sources-btn");

const { orcid: userOrcid } = await chrome.storage.local.get("orcid");

if (userOrcid) {
  document.getElementById("orcid")?.setAttribute("value", userOrcid);
}

intervalButton.addEventListener("click", () => {
  const option = (<HTMLInputElement>document.getElementById("interval")).value;
  setRecommendationInterval(parseInt(option));
});

sourcesButton.addEventListener("click", async () => {
  const { userId } = await chrome.storage.local.get("userId");
  const orcid = (<HTMLInputElement>document.getElementById("orcid")).value;

  if (!orcid) {
    alert("Please insert your 16-digit ORCiD before saving");
    return;
  }

  let { authToken } = await chrome.storage.local.get("authToken");

  const sources = [
    {
      service: "orcid",
      url: orcid,
    },
  ];

  const response = !userId
    ? await createUser(sources, userId)
    : await updateUser(sources, userId, authToken);

  if (response.status === 200 && !userId) {
    const data = await response.json();
    await chrome.storage.local.set({ userId: data.userId });
    await chrome.storage.local.set({ orcid });
  } else if (response.status === 200 && userId) {
    await chrome.storage.local.set({ orcid });
  } else {
    console.log("Error: ".concat(response.statusText));
  }

  alert("Sources edited successfully");
  window.close();
});

async function createUser(sources: Array<object>, userId: string) {
  const response = await fetch(`${PAPERMAN_API_HOST}/user`, {
    method: "POST",
    headers: {
      UserId: userId,
    },
    body: JSON.stringify(sources),
  });

  return response;
}

async function updateUser(
  sources: Array<object>,
  userId: string,
  authToken: any
) {
  const response = await fetch(`${PAPERMAN_API_HOST}/user`, {
    method: "PATCH",
    headers: {
      Authorization: authToken || (await getAuthToken()),
      UserId: userId,
    },
    body: JSON.stringify(sources),
  });

  return response;
}

function setRecommendationInterval(option: number): void {
  chrome.alarms.clearAll();
  let interval = 0;

  switch (option) {
    case 0:
      interval = 180;
      break;

    case 1:
      interval = 360;
      break;

    case 2:
      interval = 720;
      break;

    case 3:
      interval = 1440;
      break;

    default:
      break;
  }

  chrome.alarms.create("paperman-recommendation", {
    delayInMinutes: interval,
    periodInMinutes: interval,
  });

  alert("Recommendation interval edited successfully");
}
