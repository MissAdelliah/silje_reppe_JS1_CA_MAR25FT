import { $, getParams } from "./utils.js";
import { fetchAll } from "./api.js";

let allGames = [];

function buildGenreNav(items) {
  const nav = $("#genre-nav");
  if (!nav) return;

  const genres = [];
  for (let i = 0; i < items.length; i++) {
    const g = (items[i].genre || "").trim();
    if (g && genres.indexOf(g) === -1) {
      genres.push(g);
    }
  }
  genres.sort();

  nav.innerHTML = "";

  function addChip(label, value) {
    const button = document.createElement("button");
    button.className = "chip";
    button.textContent = label;
    button.dataset.genre = value || "";
    button.addEventListener("click", function () {
      const chips = nav.querySelectorAll(".chip");
      for (let i = 0; i < chips.length; i++) {
        chips[i].classList.remove("active");
      }
      button.classList.add("active");
      renderList();
    });
    nav.appendChild(button);
  }

  addChip("All Games", "");

  for (let i = 0; i < genres.length; i++) {
    addChip(genres[i], genres[i]);
  }
}

function getActiveGenre() {
  const nav = $("#genre-nav");
  if (!nav) return "";
  const active = nav.querySelector(".chip.active");
  if (!active) return "";
  return (active.dataset.genre || "").toLowerCase();
}

function getFinalPrice(item) {
  return item.onSale ? item.discountedPrice : item.price;
}

function createCard(item) {
  let price;
  if (item.onSale === true) {
    price =
      '<span class="price">NOK ' +
      Number(item.discountedPrice).toFixed(2) +
      '</span><span class="strike">NOK ' +
      Number(item.price).toFixed(2) +
      "</span>";
  } else {
    price =
      '<span class="price">NOK ' + Number(item.price).toFixed(2) + "</span>";
  }

  const title = item.title || "Untitled";
  const genre = item.genre || "–";
  const released = item.released || "";
  const rating = item.rating || "–";
  const img = item.image && item.image.url ? item.image.url : "";
  const alt = item.image && item.image.alt ? item.image.alt : item.title || "";

  return (
    '<a class="card-link" href="../product/?id=' +
    encodeURIComponent(item.id) +
    '">' +
    '<article class="card" aria-label="' +
    title +
    '">' +
    '<img class="thumb" src="' +
    img +
    '" alt="' +
    alt +
    '" />' +
    '<div class="pad">' +
    '<div class="title">' +
    title +
    "</div>" +
    '<div class="muted">' +
    genre +
    " - " +
    price +
    "</div>" +
    "</div>" +
    "</article>" +
    "</a>"
  );
}

function renderList() {
  const app = $("#app");
  const searchInput = $("#search");
  const sortSelect = $("#sort");
  if (!app) return;

  const searchText = searchInput ? searchInput.value.toLowerCase() : "";
  const selectedGenre = getActiveGenre();
  const sort = sortSelect ? sortSelect.value : "relevance";

  let results = allGames.filter(function (game) {
    const title = (game.title || "").toLowerCase();
    const desc = (game.description || "").toLowerCase();
    const genre = (game.genre || "").toLowerCase();

    let matchesText = true;
    if (searchText) {
      matchesText =
        title.indexOf(searchText) !== -1 || desc.indexOf(searchText) !== -1;
    }

    let matchesGenre = true;
    if (selectedGenre) {
      matchesGenre = genre === selectedGenre;
    }

    return matchesText && matchesGenre;
  });

  if (sort === "title") {
    results.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  } else if (sort === "price-asc") {
    results.sort(function (a, b) {
      return getFinalPrice(a) - getFinalPrice(b);
    });
  } else if (sort === "price-desc") {
    results.sort(function (a, b) {
      return getFinalPrice(b) - getFinalPrice(a);
    });
  } else if (sort === "released-desc") {
    results.sort(function (a, b) {
      return (b.released || "").localeCompare(a.released || "");
    });
  }

  let html = "<section>";
  html += '<p class="subtext">' + results.length + " results</p>";

  if (results.length === 0) {
    html += '<div class="status">No items found.</div>';
  } else {
    html += '<div class="grid">';
    for (let i = 0; i < results.length; i++) {
      html += createCard(results[i]);
    }
    html += "</div>";
  }

  html += "</section>";
  app.innerHTML = html;
}

async function initCategories() {
  const app = $("#app");
  const searchInput = $("#search");
  const sortSelect = $("#sort");

  if (app) {
    app.innerHTML = '<div class="status">Loading games…</div>';
  }

  try {
    allGames = await fetchAll();
    buildGenreNav(allGames);

    const params = getParams();
    const initialGenre = (params.get("genre") || "").toLowerCase();

    const chips = document.querySelectorAll("#genre-nav .chip");
    let found = false;

    for (let i = 0; i < chips.length; i++) {
      const chipGenre = (chips[i].dataset.genre || "").toLowerCase();
      if (chipGenre === initialGenre) {
        chips[i].classList.add("active");
        found = true;
        break;
      }
    }

    if (!found && chips.length > 0) {
      chips[0].classList.add("active");
    }

    if (searchInput) {
      searchInput.addEventListener("input", renderList);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", renderList);
    }

    renderList();
  } catch (error) {
    if (app) {
      app.innerHTML =
        '<div class="status error">' +
        (error.message || "Failed to load") +
        " — please try again.</div>";
    }
  }
}

window.addEventListener("DOMContentLoaded", initCategories);
