import { $, getParams } from "./utils.js";
import { fetchAll } from "./api.js";

let products = []; // renamed from allGames for clarity

/* Build genre navigation */
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

function getActiveGenre() {
  const nav = $("#genre-nav");
  if (!nav) return "";
  const active = nav.querySelector(".chip.active");
  return active ? (active.dataset.genre || "").toLowerCase() : "";
}

/*  Calculate final price  */
function getFinalPrice(item) {
  return item.onSale
    ? Number(item.discountedPrice || 0)
    : Number(item.price || 0);
}

/*  Create a single product card */
function createCard(item) {
  const price = item.onSale
    ? `<span class="price">NOK ${Number(item.discountedPrice).toFixed(2)}</span>
       <span class="strike">NOK ${Number(item.price).toFixed(2)}</span>`
    : `<span class="price">NOK ${Number(item.price).toFixed(2)}</span>`;

  const title = item.title || "Untitled";
  const genre = item.genre || "–";
  const img = item.image?.url || "";
  const alt = item.image?.alt || title;

  return `
    <a class="card-link" href="../product/?id=${encodeURIComponent(item.id)}">
      <article class="card" aria-label="${title}">
        <img class="thumb" src="${img}" alt="${alt}" />
        <div class="pad">
          <div class="title">${title}</div>
          <div class="muted">${genre} - ${price}</div>
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
  const sort = sortSelect?.value || "relevance";

  let results = products.filter((game) => {
    const title = (game.title || "").toLowerCase();
    const desc = (game.description || "").toLowerCase();
    const genre = (game.genre || "").toLowerCase();

    const matchesText =
      !searchText || title.includes(searchText) || desc.includes(searchText);
    const matchesGenre = !selectedGenre || genre === selectedGenre;

    return matchesText && matchesGenre;
  });

  // Sorting
  if (sort === "title") results.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === "price-asc")
    results.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
  else if (sort === "price-desc")
    results.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
  else if (sort === "released-desc")
    results.sort((a, b) => (b.released || "").localeCompare(a.released || ""));

  // Render HTML using map + join for efficiency
  const htmlContent =
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

async function initCategories() {
  const productList = $("#product-list");
  const searchInput = $("#search");
  const sortSelect = $("#sort");

  if (productList)
    productList.innerHTML = '<div class="status">Loading games…</div>';

  try {
    products = await fetchAll();
    buildGenreNav(products);

    const params = getParams();
    const initialGenre = (params.get("genre") || "").toLowerCase();

    const chips = document.querySelectorAll("#genre-nav .chip");
    const found = Array.from(chips).some((chip) => {
      if (chip.dataset.genre.toLowerCase() === initialGenre) {
        chip.classList.add("active");
        return true;
      }
      return false;
    });
    if (!found && chips.length) chips[0].classList.add("active");

    searchInput?.addEventListener("input", renderList);
    sortSelect?.addEventListener("change", renderList);

    renderList();
  } catch (error) {
    if (productList) {
      productList.innerHTML = `
        <div class="status error">
          ${error.message || "Failed to load"} — please try again.
        </div>
      `;
    }
  }
}

window.addEventListener("DOMContentLoaded", initCategories);
