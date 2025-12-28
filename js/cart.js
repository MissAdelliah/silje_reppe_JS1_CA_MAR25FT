import { fetchAll } from "./api.js";

const cartKey = "cart";

// Cache DOM elements safely
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("items-count-cart");
const cartLink = document.querySelector(".cart-link");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
let products = [];

// Initialize cart
async function initCart() {
  products = await fetchAll();
  updateCartUI();
  renderCart();

  // Checkout button event
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

// Update cart count and total safely
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  if (cartCount) cartCount.textContent = totalItems;
  if (cartLink) {
    if (totalItems > 0) cartLink.classList.add("has-items");
    else cartLink.classList.remove("has-items");
  }

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
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
      const imgSrc = item.image?.url || "";
      const price = item.price || 0;
      const quantity = item.quantity || 1;

      return `
        <div class="card cart-card" data-id="${item.id}">
          <img class="thumb" src="${imgSrc}" alt="${title}" />
          <div class="pad">
            <h2 class="title">${title}</h2>
            <p class="price">NOK ${price.toFixed(2)} x ${quantity}</p>
            <div class="cart-buttons">
              <button class="button-add increase-btn">+</button>
              <button class="button-add remove-btn">Remove</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  // Increase quantity
  cartItemsContainer.querySelectorAll(".increase-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".cart-card");
      const id = card.dataset.id;
      const cartItem = cart.find((p) => String(p.id) === id);
      if (cartItem) {
        cartItem.quantity += 1;
        saveCart();
        renderCart();
      }
    });
  });

  // Decrease quantity / remove
  cartItemsContainer.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".cart-card");
      const id = card.dataset.id;
      const cartItem = cart.find((p) => String(p.id) === id);
      if (cartItem) {
        cartItem.quantity -= 1;
        if (cartItem.quantity <= 0) {
          cart = cart.filter((p) => String(p.id) !== id);
        }
        saveCart();
        renderCart();
      }
    });
  });
}

// Add product to cart (called from product.js)
export function addToCart(product) {
  const existing = cart.find((p) => String(p.id) === String(product.id));
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: Number(product.onSale ? product.discountedPrice : product.price),
      image: product.image,
      quantity: 1,
    });
  }
  saveCart();
  renderCart();
}

// Initialize safely
window.addEventListener("DOMContentLoaded", initCart);
