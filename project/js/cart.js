import { fetchAll } from "./api.js";

const cartKey = "cart";
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("items-count-cart");
const cartLink = document.querySelector(".cart-link");
const cartTotalEl = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutForm = document.getElementById("checkout-form");
const checkoutInputs = document.querySelectorAll("#checkout-form input");

let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
let products = [];

// ----------------------- INIT CART -----------------------
async function initCart() {
  products = await fetchAll();
  renderCart();
  updateCartUI();
  setupCheckout();
}

// ----------------------- SAVE CART -----------------------
function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartUI();
}

// ----------------------- UPDATE UI -----------------------
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  if (cartCount) cartCount.textContent = totalItems;
  if (cartLink) {
    totalItems > 0
      ? cartLink.classList.add("has-items")
      : cartLink.classList.remove("has-items");
  }
  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
}

// ----------------------- RENDER CART -----------------------
function renderCart() {
  if (!cartItemsContainer) return;
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<div class="status">Your cart is empty.</div>`;
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
    <div class="card cart-card" data-id="${item.id}">
      <img class="thumb" src="${item.image?.url || ""}" alt="${item.title}" />
      <div class="pad">
        <h2 class="title">${item.title}</h2>
        <p class="price">NOK ${item.price.toFixed(2)} x ${item.quantity}</p>
        <div class="cart-buttons">
          <button class="button-add increase-btn">+</button>
          <button class="button-add remove-btn">Remove</button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Add events after rendering
  cartItemsContainer
    .querySelectorAll(".increase-btn")
    .forEach((btn) =>
      btn.addEventListener("click", (e) => changeQuantity(e, 1))
    );
  cartItemsContainer
    .querySelectorAll(".remove-btn")
    .forEach((btn) =>
      btn.addEventListener("click", (e) => changeQuantity(e, -1))
    );
}

// ----------------------- CHANGE QUANTITY -----------------------
function changeQuantity(e, delta) {
  const card = e.target.closest(".cart-card");
  const id = card.dataset.id;
  const cartItem = cart.find((p) => String(p.id) === id);
  if (!cartItem) return;
  cartItem.quantity += delta;
  if (cartItem.quantity <= 0) cart = cart.filter((p) => String(p.id) !== id);
  saveCart();
  renderCart();
}

// ----------------------- ADD TO CART -----------------------
export function addToCart(product) {
  const existing = cart.find((p) => String(p.id) === String(product.id));
  if (existing) existing.quantity += 1;
  else
    cart.push({
      id: product.id,
      title: product.title,
      price: Number(product.onSale ? product.discountedPrice : product.price),
      image: product.image,
      quantity: 1,
    });
  saveCart();
  renderCart();
}

// ----------------------- FORM VALIDATION -----------------------
function validateField(field) {
  const value = field.value.trim();
  let valid = true;

  if (field.required && !value) valid = false;
  else if (field.type === "email")
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Optional gift email should only be validated if filled
  if (field.id === "gift-email" && value === "") {
    valid = true; // empty gift email is valid
  } else if (field.required && !value) {
    valid = false;
  } else if (field.type === "email") {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Apply borders
  if (field === document.activeElement) field.style.border = "2px solid purple";
  else field.style.border = valid ? "2px solid green" : "2px solid red";

  return valid;
}

function validateForm(form) {
  let isValid = true;
  form.querySelectorAll("input").forEach((input) => {
    if (!validateField(input)) isValid = false;
  });
  return isValid;
}

// Add input events
checkoutForm?.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => validateField(input));
  input.addEventListener(
    "focus",
    () => (input.style.border = "2px solid purple")
  );
  input.addEventListener("blur", () => validateField(input));
});

// ----------------------- INPUT RESTRICTIONS -----------------------
checkoutForm?.querySelectorAll("input").forEach((input) => {
  // Numeric-only inputs
  if (input.id === "cvc" || input.id === "card") {
    input.setAttribute("maxlength", input.id === "cvc" ? 3 : 16);
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");
      validateField(input);
    });
  }

  // Expire: MM/YY, allow numbers and "/"
  if (input.id === "expire") {
    input.setAttribute("maxlength", 5);
    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase().replace(/[^0-9/]/g, ""); // only numbers and /
      validateField(input);
    });
  }
});

// ----------------------- CHECKOUT PROCESS -----------------------
function setupCheckout() {
  checkoutBtn?.addEventListener("click", async () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    if (!validateForm(checkoutForm))
      return alert("Please fix errors in the form.");

    // Create progress bar
    const progress = document.createElement("div");
    progress.className = "checkout-progress";
    progress.style.cssText =
      "position: fixed; top:0; left:0; width:0%; height:5px; background: linear-gradient(90deg, #8660f0, #c76bf1); z-index:9999; transition: width 0.3s;";
    document.body.appendChild(progress);

    // Animate progress
    let width = 0;
    const interval = setInterval(() => {
      width += 2;
      progress.style.width = width + "%";
      if (width >= 100) {
        clearInterval(interval);
        progress.innerHTML = `<span style="color:#9e9d9d;position:absolute;right:10px;top:-25px;"></span>`;
        setTimeout(() => {
          localStorage.setItem("lastorder", JSON.stringify(cart));
          cart = [];
          localStorage.removeItem("cart");
          saveCart();
          window.location.href = "confirmation/index.html";
        }, 700);
      }
    }, 30);
  });
}

// ----------------------- INIT -----------------------
window.addEventListener("DOMContentLoaded", initCart);
