import { $, getParams } from "./utils.js";
import { fetchAll } from "./api.js";
import { addToCart } from "./cart.js";

let products = [];
//Fetch and render single product on ID from URL
async function renderProduct() {
  const details = $("#product-details");
  if (!details) return;

  // Correctly get product ID from URL
  const params = getParams();
  const productId = params.get ? params.get("id") : params.id;

  if (!productId) {
    //Message if no product ID is found
    details.innerHTML = `<div class="status">Product not found.</div>`;
    return;
  }

  // Load all products if not already and find current product
  if (products.length === 0) products = await fetchAll();
  const product = products.find((p) => String(p.id) === String(productId));

  if (!product) {
    //Message if product dosen't exist
    details.innerHTML = `<div class="status">Product not found.</div>`;
    return;
  }

  const priceHTML = product.onSale //Prise and sale price
    ? `<span class="price-current">NOK ${Number(
        product.discountedPrice
      ).toFixed(2)}</span> 
       <span class="price-original strike">NOK ${Number(product.price).toFixed(
         2
       )}</span>`
    : `<span class="price-current">NOK ${Number(product.price).toFixed(
        2
      )}</span>`;

  // Insert product card HTML
  details.innerHTML = `
    <div class="product-card">
      <img class="product-image" src="${product.image?.url || ""}" alt="${
    product.image?.alt || product.title
  }" />
      <div class="product-info">
        <h1>${product.title}</h1>
        <p>${product.description || ""}</p>
        <p>Genre: ${product.genre || "–"}</p>
        <p>Age Rating: ${product.ageRating || "–"}</p>
        <p>Price: ${priceHTML}</p>
        <button id="add-to-cart" class="button-add">Add to Cart</button>
      </div>
    </div>
  `;

  // Add event listener for Add to Cart
  $("#add-to-cart")?.addEventListener("click", () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.onSale ? product.discountedPrice : product.price,
      image: product.image,
    });

    alert("Product added to cart!");
  });
}
//Run the render function when DOM is fully loaded
document.addEventListener("DOMContentLoaded", renderProduct);
