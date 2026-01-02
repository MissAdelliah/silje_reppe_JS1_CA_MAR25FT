import { $, getParams } from "./utils.js";
import { fetchAll } from "./api.js";
import { addToCart } from "./cart.js";

let products = [];

async function initCategories() {
  const productList = $("#product-list");
  const searchInput = $("#search");
  const sortSelect = $("#sort");

  if (productList)
    productList.innerHTML = '<div class="status">Loading games…</div>';

  try {
    //Fetch all products by genre
    products = await fetchAll();
    buildGenreNav(products);
    buildAgeNav();

    const firstGenre = $("#genre-nav .chip");
    if (firstGenre) firstGenre.classList.add("active");

    const firstAge = $("#age-nav .chip");
    if (firstAge) firstAge.classList.add("active");
    //Search and sort eventlistener
    searchInput?.addEventListener("input", renderList);
    sortSelect?.addEventListener("change", renderList);

    renderList();
  } catch (error) {
    //If fetching fails show error message
    if (productList) {
      productList.innerHTML = `<div class="status error">${
        error.message || "Failed to load"
      } — please try again.</div>`;
    }
  }
}
//Run init after DOM is loaded
window.addEventListener("DOMContentLoaded", initCategories);

function buildGenreNav(items) {
  const nav = $("#genre-nav");
  if (!nav) return;

  const genreSet = new Set();
  items.forEach((item) => {
    const g = (item.genre || "").trim();
    if (g) genreSet.add(g);
  });

  const genres = Array.from(genreSet).sort();

  nav.innerHTML = "";

  function addChip(label, value) {
    const button = document.createElement("button");
    button.className = "chip";
    button.textContent = label;
    button.dataset.genre = value || "";

    button.addEventListener("click", () => {
      nav
        .querySelectorAll(".chip")
        .forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
      renderList();
    });

    nav.appendChild(button);
  }

  addChip("All Games", "");
  genres.forEach((genre) => addChip(genre, genre));
}

function buildAgeNav() {
  const nav = $("#age-nav");
  if (!nav) return;

  nav.innerHTML = "";

  function addChip(label, value) {
    const button = document.createElement("button");
    button.className = "chip";
    button.textContent = label;
    button.dataset.age = value;

    button.addEventListener("click", () => {
      nav
        .querySelectorAll(".chip")
        .forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
      renderList();
    });

    nav.appendChild(button);
  }

  addChip("All Games", "all");
  addChip("Kids", "kids");
  addChip("Adult", "adult");
}

function getActiveGenre() {
  const active = $("#genre-nav .chip.active");
  return active ? (active.dataset.genre || "").toLowerCase() : "";
}

function getActiveAge() {
  const active = $("#age-nav .chip.active");
  return active ? active.dataset.age : "all";
}
//Returns the final price of a product, accounting for discounts
function getFinalPrice(item) {
  return item.onSale
    ? Number(item.discountedPrice || 0)
    : Number(item.price || 0);
}

function createCard(item) {
  const productId = item.id;
  const priceHTML = item.onSale
    ? `<span class="card__price-current">NOK ${Number(
        item.discountedPrice
      ).toFixed(2)}</span>
       <span class="card__price-original strike">NOK ${Number(
         item.price
       ).toFixed(2)}</span>`
    : `<span class="card__price-current">NOK ${Number(item.price).toFixed(
        2
      )}</span>`;
  //Sort and displays the list of products based on search, genre, and age
  const title = item.title || "Untitled";
  const genre = item.genre || "–";
  const imgSrc = item.image?.url || "";
  const imgAlt = item.image?.alt || title;

  return `
    <a class="card-link" href="./project/product/index.html?id=${encodeURIComponent(
      productId
    )}">
      <article class="card" aria-labelledby="card-title-${productId}">
        <img class="thumb" src="${imgSrc}" alt="${imgAlt}" />
        <div class="pad">
          <h2 id="card-title-${productId}" class="title">${title}</h2>
          <div class="muted">
            <span class="genre">${genre}</span> - 
            <span class="price">${priceHTML}</span>
          </div>
        </div>
      </article>
    </a>
  `;
}

function renderList() {
  const productList = $("#product-list");
  const searchInput = $("#search");
  const sortSelect = $("#sort");

  if (!productList) return;

  const searchText = searchInput?.value.toLowerCase() || "";
  const selectedGenre = getActiveGenre();
  const activeAge = getActiveAge();
  const sort = sortSelect?.value || "relevance";
  //Sort products based on search text, selected genre, and age
  const results = products.filter((game) => {
    const title = (game.title || "").toLowerCase();
    const desc = (game.description || "").toLowerCase();
    const genre = (game.genre || "").toLowerCase();

    const matchesText =
      !searchText || title.includes(searchText) || desc.includes(searchText);
    const matchesGenre = !selectedGenre || genre === selectedGenre;

    //Age filtering
    let matchesAge = true;
    const age = parseInt((game.ageRating || "").replace(/\D/g, "")) || 0;
    if (activeAge === "kids") matchesAge = age < 18; //If under 18years
    else if (activeAge === "adult") matchesAge = age >= 18; //If over 18years 'I would like to add a function where kids cant buy adult games'

    return matchesText && matchesGenre && matchesAge;
  });

  // Attach Add to Cart events after rendering
  document.querySelectorAll(".button-add").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const productId = results[index].id; // results comes from renderList()
      addToCart(productId);
      // optional feedback
      alert("Product added to cart!");
    });
  });

  //Sorting based on user selection
  if (sort === "title")
    results.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  else if (sort === "price-asc")
    results.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
  else if (sort === "price-desc")
    results.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
  else if (sort === "released-desc")
    results.sort((a, b) => (b.released || "").localeCompare(a.released || ""));

  const htmlContent =
    //Render products or show a message if no results
    results.length === 0
      ? `<div class="status">No items found.</div>`
      : `<div class="grid">${results.map(createCard).join("")}</div>`;

  productList.innerHTML = `
    <section>
      <p class="subtext">${results.length} results</p>
      ${htmlContent}
    </section>
  `;
}
