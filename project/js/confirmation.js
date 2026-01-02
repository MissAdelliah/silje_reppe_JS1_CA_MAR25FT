window.addEventListener("DOMContentLoaded", () => {
  //Runs when page content is fully loaded
  //DOM elements
  const orderIdEl = document.getElementById("order-id");
  const orderItemsContainer = document.getElementById("order-items");
  const orderTotalEl = document.getElementById("order-total");

  //Retrive resent order
  const lastorder = JSON.parse(localStorage.getItem("lastorder")) || [];

  //Random order number generator
  function generateorderNumber() {
    return "ORD-" + Math.floor(Math.random() * 1000000);
  }

  if (orderIdEl) {
    //Display number
    orderIdEl.textContent = generateorderNumber();
  }

  //Render each ordered item and calculate the total price
  if (lastorder.length && orderItemsContainer) {
    let total = 0;

    lastorder.forEach((item) => {
      const itemTotal = (item.price * item.quantity).toFixed(2); //Calculate total price for single item
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
      orderTotalEl.textContent = `Total: NOK ${total.toFixed(2)}`; //Final price
    }
  } else {
    // If no order exists, show message
    if (orderItemsContainer) {
      orderItemsContainer.innerHTML = `<p>Your order could not be loaded.</p>`;
    }
    if (orderTotalEl) orderTotalEl.textContent = "";
  }
});
