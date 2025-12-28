import { $, getParams } from "./utils.js";
import { fetchAll } from "./api.js"; // Or fetchOne if your API supports fetching by ID
import { addToCart } from "./cart.js";

async function renderProduct() {
  const container = $("#product-details");
  if (!container) return;

  const params = getParams();
  const productId = params.get("id"); // gets ?id=123 from URL

  if (!productId) {
    container.innerHTML =
      '<div class="status error">No product ID provided.</div>';
    return;
  }

  container.innerHTML = '<div class="status">Loading product…</div>';

  try {
    const allProducts = await fetchAll(); // Or fetchOne(productId)
    const product = allProducts.find((p) => String(p.id) === productId);

    if (!product) {
      container.innerHTML =
        '<div class="status error">Product not found.</div>';
      return;
    }

    const priceHTML = product.onSale
      ? `<span class="price-current">NOK ${Number(
          product.discountedPrice
        ).toFixed(2)}</span>
         <span class="price-original strike">NOK ${Number(
           product.price
         ).toFixed(2)}</span>`
      : `<span class="price-current">NOK ${Number(product.price).toFixed(
          2
        )}</span>`;

    container.innerHTML = `
  <div class="product-card">
    <img class="product-image" src="${product.image?.url || ""}" alt="${
      product.image?.alt || product.title
    }" />
    <div class="product-info">
      <h1>${product.title || "Untitled"}</h1>
      <p><strong>Genre:</strong> ${product.genre || "–"}</p>
      <p><strong>Released:</strong> ${product.released || "–"}</p>
      <p><strong>Age Rating:</strong> ${product.ageRating || "–"}</p>
      <p>${product.description || ""}</p>
      <p>${priceHTML}</p>
      <button class="button-add">Add to Cart</button>
    </div>
  </div>
`;
  } catch (error) {
    container.innerHTML = `<div class="status error">${
      error.message || "Failed to load"
    } — please try again.</div>`;
  }
}

window.addEventListener("DOMContentLoaded", renderProduct);
