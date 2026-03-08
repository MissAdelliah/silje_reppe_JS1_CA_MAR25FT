import { fetchAll } from './api.js';

const cartKey = 'cart';

// DOM elements
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('items-count-cart');
const cartLink = document.querySelector('.cart-link');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutForm = document.getElementById('checkout-form');
const checkoutInputs = document.querySelectorAll('#checkout-form input');

// Cart data
let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
let products = [];

// Init cart
async function initCart() {
  products = await fetchAll();
  renderCart();
  updateCartUI();
  setupCheckout();
  setupCheckoutInputs();
}

// Save cart
function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartUI();
}

// Update cart UI
function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  if (cartCount) cartCount.textContent = totalItems;

  if (cartLink) {
    if (totalItems > 0) cartLink.classList.add('has-items');
    else cartLink.classList.remove('has-items');
  }

  const total = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0,
  );

  if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
}

// Render cart
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
          <img class="thumb" src="${item.image?.url || ''}" alt="${item.title}" />
          <div class="pad">
            <h2 class="title">${item.title}</h2>
            <p class="price">NOK ${item.price.toFixed(2)} x ${item.quantity}</p>
            <div class="cart-buttons">
              <button class="button-add increase-btn">+</button>
              <button class="button-add remove-btn">Remove</button>
            </div>
          </div>
        </div>
      `,
    )
    .join('');

  cartItemsContainer.querySelectorAll('.increase-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => changeQuantity(e, 1));
  });

  cartItemsContainer.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => changeQuantity(e, -1));
  });
}

// Change quantity
function changeQuantity(e, delta) {
  const card = e.target.closest('.cart-card');
  if (!card) return;

  const id = card.dataset.id;
  const cartItem = cart.find((item) => String(item.id) === String(id));
  if (!cartItem) return;

  cartItem.quantity += delta;

  if (cartItem.quantity <= 0) {
    cart = cart.filter((item) => String(item.id) !== String(id));
  }

  saveCart();
  renderCart();
}

// Add product to cart
export function addToCart(product) {
  const existing = cart.find((item) => String(item.id) === String(product.id));

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

// Validate one field
function validateField(field) {
  const value = field.value.trim();
  let valid = true;

  if (field.id === 'gift-email' && value === '') {
    valid = true;
  } else if (field.required && value === '') {
    valid = false;
  } else if (
    (field.type === 'email' || field.id === 'gift-email') &&
    value !== ''
  ) {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // only show red/green when field is not focused
  if (document.activeElement !== field) {
    field.style.border = valid ? '2px solid green' : '2px solid red';
  }

  return valid;
}

// Validate full form
function validateForm(form) {
  if (!form) return false;

  let isValid = true;

  form.querySelectorAll('input').forEach((input) => {
    if (!validateField(input)) isValid = false;
  });

  return isValid;
}

// Setup input listeners
function setupCheckoutInputs() {
  if (!checkoutForm) return;

  checkoutInputs.forEach((input) => {
    input.addEventListener('blur', () => {
      validateField(input);
    });

    // card and cvc = numbers only
    if (input.id === 'cvc' || input.id === 'card') {
      input.setAttribute('maxlength', input.id === 'cvc' ? '3' : '16');

      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '');
      });
    }

    // expiry = MM/YY
    if (input.id === 'expire') {
      input.setAttribute('maxlength', '5');

      input.addEventListener('input', () => {
        let value = input.value.replace(/\D/g, '').slice(0, 4);

        if (value.length > 2) {
          value = value.slice(0, 2) + '/' + value.slice(2);
        }

        input.value = value;
      });
    }
  });
}

// Checkout
function setupCheckout() {
  if (!checkoutBtn || !checkoutForm) return;

  checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!validateForm(checkoutForm)) {
      alert('Please fix errors in the form.');
      return;
    }

    const progress = document.createElement('div');
    progress.className = 'checkout-progress';
    progress.style.cssText =
      'position: fixed; top:0; left:0; width:0%; height:5px; background: linear-gradient(90deg, #8660f0, #c76bf1); z-index:9999; transition: width 0.3s;';

    document.body.appendChild(progress);

    let width = 0;

    const interval = setInterval(() => {
      width += 2;
      progress.style.width = width + '%';

      if (width >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          localStorage.setItem('lastorder', JSON.stringify(cart));
          cart = [];
          localStorage.removeItem(cartKey);
          saveCart();
          window.location.href = 'confirmation/index.html';
        }, 700);
      }
    }, 30);
  });
}

// Start
window.addEventListener('DOMContentLoaded', initCart);
