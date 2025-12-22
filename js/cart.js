const KEY = "se_cart_v1";

// get localStorage array
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

// saves array in cart to localStorage
function saveCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function clearCart() {
  saveCart([]);
}
export function cartCount() {
  const items = getCart();
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    total += items[i].qty;
  }

  return total;
}

export function cartTotal() {
  const items = getCart();
  let sum = 0;

  for (let i = 0; i < items.length; i++) {
    sum += items[i].qty * Number(items[i].price);
  }

  return sum;
}

export function addToCart(product, qty) {
  if (!qty) {
    qty = 1;
  }

  const items = getCart();
  const id = product.id;
  let price = product.onSale ? product.discountedPrice : product.price;
  price = Number(price);

  let found = false;

  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      items[i].qty += qty;
      found = true;
      break;
    }
  }

  if (!found) {
    items.push({
      id: id,
      title: product.title,
      image: product.image && product.image.url ? product.image.url : "",
      price: price,
      qty: qty,
    });
  }

  saveCart(items);
}

export function removeFromCart(id) {
  const items = getCart().filter(function (item) {
    return item.id !== id;
  });
  saveCart(items);
}

export function setQty(id, qty) {
  const items = getCart();
  const value = Math.max(1, Number(qty) || 1);

  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      items[i].qty = value;
      break;
    }
  }
  saveCart(items);
}
