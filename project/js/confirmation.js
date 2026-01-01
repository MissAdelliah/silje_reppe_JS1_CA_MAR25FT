// confirmation.js
window.addEventListener("DOMContentLoaded", () => {
  // ----------------------- DOM ELEMENTS -----------------------
  const orderIdEl = document.getElementById("order-id");
  const orderItemsContainer = document.getElementById("order-items");
  const orderTotalEl = document.getElementById("order-total");

  // ----------------------- FETCH LAST order -----------------------
  const lastorder = JSON.parse(localStorage.getItem("lastorder")) || [];

  // ----------------------- GENERATE order NUMBER -----------------------
  function generateorderNumber() {
    return "ORD-" + Math.floor(Math.random() * 1000000);
  }

  if (orderIdEl) {
    orderIdEl.textContent = generateorderNumber();
  }

  // ----------------------- RENDER orderED ITEMS -----------------------
  if (lastorder.length && orderItemsContainer) {
    let total = 0;

    lastorder.forEach((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      total += Number(itemTotal);

      const div = document.createElement("div");
      div.className = "card cart-card confirmation-card-item"; // reuse cart styling
      div.innerHTML = `
        <img class="thumb" src="${item.image?.url || item.image || ""}" alt="${
        item.title
      }" />
        <div class="pad">
          <h2 class="title">${item.title}</h2>
          <p class="price">NOK ${item.price.toFixed(2)} x ${
        item.quantity
      } = NOK ${itemTotal}</p>
        </div>
      `;
      orderItemsContainer.appendChild(div);
    });

    if (orderTotalEl) {
      orderTotalEl.textContent = `Total: NOK ${total.toFixed(2)}`;
    }
  } else {
    // If no order exists, show message
    if (orderItemsContainer) {
      orderItemsContainer.innerHTML = `<p>Your order could not be loaded.</p>`;
    }
    if (orderTotalEl) orderTotalEl.textContent = "";
  }

  // ----------------------- OPTIONAL: CLEAR LAST order -----------------------
  // Only clear after rendering so user can see data if they reload
  // localStorage.removeItem("lastorder");
});
