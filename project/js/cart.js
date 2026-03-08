import { fetchAll } from './api.js'; //Fetching all products from the API

const cartKey = 'cart'; //Store and retrive cart data
//DOM elements to display and control
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('items-count-cart');
const cartLink = document.querySelector('.cart-link');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutForm = document.getElementById('checkout-form');
const checkoutInputs = document.querySelectorAll('#checkout-form input');
//Loads saved cart data localStorage or init an empty cart
let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
let products = [];

//Init the cart by fetch products, updating
async function initCart() {
  products = await fetchAll();
  renderCart();
  updateCartUI();
  setupCheckout();
}

//Saves current cart state to lockalStore and refreses the cart
function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  //Updates cart related UI elements
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0); //Calculates amount of items in cart, sum up quantities
  if (cartCount) cartCount.textContent = totalItems; //Updates the cart item count if exsist
  if (cartLink) {
    totalItems > 0
      ? cartLink.classList.add('has-items') //Adds items
      : cartLink.classList.remove('has-items'); //removes items
  }
  const total = cart.reduce(
    //Calc total cart price
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0), //multiplying item price with quantity
    0,
  );
  if (cartTotalEl) cartTotalEl.textContent = total.toFixed(2);
}

function renderCart() {
  //Renders the cart content or shows emty state if no items
  if (!cartItemsContainer) return;
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<div class="status">Your cart is empty.</div>`; //Display message if empty
    return;
  }

  //Renders cart items by generating HTML from the cart array
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

  //Click events to cart button
  cartItemsContainer
    .querySelectorAll('.increase-btn')
    .forEach((btn) =>
      btn.addEventListener('click', (e) => changeQuantity(e, 1)),
    );
  cartItemsContainer
    .querySelectorAll('.remove-btn')
    .forEach((btn) =>
      btn.addEventListener('click', (e) => changeQuantity(e, -1)),
    );
}

//Updates the quantity of cart item, removees if quanitity reach 0
function changeQuantity(e, delta) {
  const card = e.target.closest('.cart-card');
  const id = card.dataset.id;
  const cartItem = cart.find((p) => String(p.id) === id);
  if (!cartItem) return;
  cartItem.quantity += delta;
  if (cartItem.quantity <= 0) cart = cart.filter((p) => String(p.id) !== id); //If quanitity is 0 or less, removes item from cart
  saveCart();
  renderCart();
}

export function addToCart(product) {
  // Add to cart and increase quantity
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

  field.style.setProperty(
    'border',
    valid ? '2px solid green' : '2px solid red',
    'important',
  );

  return valid;
}
checkoutForm?.querySelectorAll('input').forEach((input) => {
  input.addEventListener('focus', () => {
    input.style.setProperty('border', '2px solid purple', 'important');
  });

  input.addEventListener('blur', () => {
    validateField(input);
  });

  input.addEventListener('input', () => {
    validateField(input);
  });
});

// Restricting input formats for payment fields
checkoutForm?.querySelectorAll('input').forEach((input) => {
  // Numeric-only inputs
  if (input.id === 'cvc' || input.id === 'card') {
    input.setAttribute('maxlength', input.id === 'cvc' ? 3 : 16);
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
      validateField(input);
    });
  }

  // Expire: MM/YY, allow numbers and "/" 'I would like to add a function where it sets a "/" after two didgets
  if (input.id === 'expire') {
    input.setAttribute('maxlength', 5); //Max 5, 00000
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase().replace(/[^0-9/]/g, '');
      validateField(input);
    });
  }
});

function setupCheckout() {
  checkoutBtn?.addEventListener('click', async () => {
    if (cart.length === 0) return alert('Your cart is empty!'); //Stops checkout flow if cart is empty or form is invalid
    if (!validateForm(checkoutForm))
      return alert('Please fix errors in the form.');

    // Checkout progression bar, loading
    const progress = document.createElement('div');
    progress.className = 'checkout-progress';
    progress.style.cssText =
      'position: fixed; top:0; left:0; width:0%; height:5px; background: linear-gradient(90deg, #8660f0, #c76bf1); z-index:9999; transition: width 0.3s;';
    document.body.appendChild(progress);

    let width = 0;
    const interval = setInterval(() => {
      //Starts timed animation
      width += 2; //Simulate checkout prosessing
      progress.style.width = width + '%';
      if (width >= 100) {
        //Stop animation at 100% and take customer to confirmation page
        clearInterval(interval);
        progress.innerHTML = `<span style="color:#9e9d9d;position:absolute;right:10px;top:-25px;"></span>`; //Updates progress bar after completed
        setTimeout(() => {
          //Waits a moment before completing purchase and redirect customer
          localStorage.setItem('lastorder', JSON.stringify(cart)); //Saves the order, clear cart and update storage
          cart = [];
          localStorage.removeItem('cart');
          saveCart();
          window.location.href = 'confirmation/index.html'; //Redirect customer to confirmation page
        }, 700);
      }
    }, 30);
  });
}

//Init the cart when page has fully loaded
window.addEventListener('DOMContentLoaded', initCart);
