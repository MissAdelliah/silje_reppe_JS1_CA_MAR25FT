const API_KEY = "https://docs.noroff.dev/docs/v2/e-commerce/gamehub";
const API_URL_PRODUCTS = `${API_URL}/rainy-days`;

export async function getAllProductData() {
  const url = API_KEY;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to load data");
    }

    const result = await response.json();
    console.log(result.data);
    return result.data; //Returns array of products
  } catch (error) {
    console.error(error.message);
  }
}
