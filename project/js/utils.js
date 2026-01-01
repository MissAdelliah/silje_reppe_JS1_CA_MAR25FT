// created a shortcut for queryselector that targets one element
export function $(selector) {
  return document.querySelector(selector);
}

// created a shortcut for queryselector that target multple elements
export function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

// fetches parameter from the URL
export function getParams() {
  return new URLSearchParams(location.search);
}
