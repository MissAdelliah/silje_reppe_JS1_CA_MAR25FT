/* First try on fetching Api data
const API_KEY = "https://v2.api.noroff.dev/gamehub";
const API_URL_PRODUCTS = `${API_URL}/gamehub`;

export async function getAllProductData() {
  const url = API_KEY;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to load game data");
    }

    const result = await response.json();
    console.log(result.data);
    return result.data; //Returns array of products
  } catch (error) {
    console.error(error.message);
  }
}
  */

const ENDPOINT = "https://v2.api.noroff.dev/gamehub";

// fetches API data
export async function fetchAll() {
  const response = await fetch(ENDPOINT);
  if (!response.ok) {
    throw new Error("Failed to load data");
  }
  const json = await response.json();
  if (!json || !Array.isArray(json.data)) {
    return [];
  }
  return json.data;
}

// fetches single game by ID
export async function fetchOne(id) {
  const response = await fetch(ENDPOINT + "/" + encodeURIComponent(id));
  if (!response.ok) {
    throw new Error("Game not found");
  }
  const json = await response.json();
  return json.data || null;
}
