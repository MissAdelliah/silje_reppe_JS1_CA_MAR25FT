import { fetchAll } from "./api.js";

const cartKey = "cart";
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("items-count-cart");
const cartLink = document.querySelector(".cart-link");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
let products = [];

// Initialize
async function initCart() {
  products = await fetchAll();
  updateCartUI();
  renderCart();

  checkoutBtn?.addEventListener("click", () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    alert("Checkout complete! Thank you for your purchase.");
    cart = [];
    saveCart();
    renderCart();
  });
}

// Save cart to localStorage and update header
function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartUI();
}

// Update cart count and indicator
function updateCartUI() {
  cartCount.textContent = cart.length;
  if (cart.length > 0) cartLink.classList.add("has-items");
  else cartLink.classList.remove("has-items");

  const total = cart.reduce(
    (sum, item) => sum + (item.discountedPrice || item.price || 0),
    0
  );
  if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
}

// Render cart items
function renderCart() {
  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<div class="status">Your cart is empty.</div>`;
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map((item) => {
      const title = item.title || "Untitled";
      const price = item.onSale ? item.discountedPrice : item.price;
      const imgSrc = item.image?.url || "";
      return `
        <div class="card cart-card" data-id="${item.id}">
          <img class="thumb" src="${imgSrc}" alt="${title}" />
          <div class="pad">
            <h2 class="title">${title}</h2>
            <p class="price">NOK ${price.toFixed(2)}</p>
            <button class="button-add remove-btn">Remove</button>
          </div>
        </div>
      `;
    })
    .join("");

  // Add remove button events
  cartItemsContainer.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".cart-card");
      const id = card.dataset.id;
      cart = cart.filter((p) => String(p.id) !== id);
      saveCart();
      renderCart();
    });
  });
}

// Add to cart function for products.js
export function addToCart(productId) {
  const product = products.find((p) => String(p.id) === String(productId));
  if (!product) return;

  cart.push(product);
  saveCart();
  renderCart();
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", initCart);
