const productsGrid = document.querySelector(".products--grid");

const API_URL = "https://v2.api.noroff.dev/gamehub";

// Fetch all products
async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Render products into the DOM
function displayProducts(products) {
  productsGrid.innerHTML = "";

  // In Javascript for cleaner HTML
  products.forEach((product) => {
    const card = `
      <a class="product__link" href="game.html?id=${product.id}">
        <div class="product__card">
          <img class="product__img" src="${product.image.url}" alt="${product.image.alt}" loading="lazy" decoding="async">
          <h3 class="product__title">${product.title}</h3>
          <p class="product__price">${product.price} USD</p>
        </div>
      </a>
    `;
    productsGrid.innerHTML += card;
  });
}

// Filters
function filterProducts(products) {
  const allRadio = document.getElementById("all-filter");
  const menRadio = document.getElementById("men-filter");
  const womenRadio = document.getElementById("women-filter");

  function update() {
    let filtered = products;

    if (menRadio.checked) {
      filtered = products.filter(
        (p) =>
          p.gender.toLowerCase() === "male" || p.gender.toLowerCase() === "men"
      );
    }

    if (womenRadio.checked) {
      filtered = products.filter(
        (p) =>
          p.gender.toLowerCase() === "female" ||
          p.gender.toLowerCase() === "women"
      );
    }

    displayProducts(filtered);
  }

  // Added event listeners to the radio buttons
  allRadio.addEventListener("change", update);
  menRadio.addEventListener("change", update);
  womenRadio.addEventListener("change", update);

  // Show all products by default
  displayProducts(products);
}

async function init() {
  const products = await loadProducts();
  filterProducts(products);
}

init();
