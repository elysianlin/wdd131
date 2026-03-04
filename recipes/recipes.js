// =========================
//   Recipe Data
// =========================
const recipes = [
  {
    name: "Bibimbap",
    image: "images/Bibimbap.jpg",
    tags: ["Korean"],
    rating: 4,
    description: "A traditional Korean mixed rice dish with vegetables and meat.",
  },
  {
    name: "Spaghetti Carbonara",
    image: "images/carbonara.jpg",
    tags: ["Italian", "Pasta"],
    rating: 5,
    description: "A classic Roman pasta with eggs, cheese, pancetta, and pepper.",
  },
  {
    name: "Tacos al Pastor",
    image: "images/tacos.jpg",
    tags: ["Mexican", "Street Food"],
    rating: 5,
    description: "Marinated pork tacos with pineapple, onion, and cilantro.",
  },
  {
    name: "Chicken Tikka Masala",
    image: "images/tikka.jpg",
    tags: ["Indian", "Curry"],
    rating: 4,
    description: "Tender chicken in a rich, creamy spiced tomato sauce.",
  },
  {
    name: "Greek Salad",
    image: "images/greek-salad.jpg",
    tags: ["Greek", "Vegetarian", "Salad"],
    rating: 4,
    description: "Fresh tomatoes, cucumber, olives, and feta with olive oil.",
  },
  {
    name: "Beef Ramen",
    image: "images/ramen.jpg",
    tags: ["Japanese", "Soup"],
    rating: 5,
    description: "Slow-braised beef in a deep, savory broth with noodles and soft-boiled egg.",
  },
  {
    name: "Margherita Pizza",
    image: "images/pizza.jpg",
    tags: ["Italian", "Vegetarian"],
    rating: 4,
    description: "Classic Neapolitan pizza with tomato, fresh mozzarella, and basil.",
  },
  {
    name: "Pad Thai",
    image: "images/pad-thai.jpg",
    tags: ["Thai", "Noodles"],
    rating: 4,
    description: "Stir-fried rice noodles with shrimp, egg, bean sprouts, and peanuts.",
  },
];

// =========================
//   Helpers
// =========================

/**
 * Build a star rating string (⭐ filled + ☆ empty).
 * @param {number} rating - Score out of 5
 * @returns {string} HTML string for the rating
 */
function buildStars(rating) {
  const max = 5;
  let stars = "";
  for (let i = 1; i <= max; i++) {
    if (i <= rating) {
      stars += `<span aria-hidden="true" class="icon-star">⭐</span>`;
    } else {
      stars += `<span aria-hidden="true" class="icon-star-empty">☆</span>`;
    }
  }
  return stars;
}

/**
 * Build the HTML for a single recipe card.
 * @param {Object} recipe
 * @returns {string} HTML string
 */
function buildCard(recipe) {
  const tagHTML = recipe.tags
    .map((t) => `<span class="tag">${t}</span>`)
    .join("");

  return `
    <section class="recipe-card">
      <img src="${recipe.image}" alt="${recipe.name}" class="recipe-img">
      <div class="recipe-content">
        <div class="tags-row">${tagHTML}</div>
        <h2>${recipe.name}</h2>
        <span class="rating"
              role="img"
              aria-label="Rating: ${recipe.rating} out of 5 stars">
          ${buildStars(recipe.rating)}
        </span>
        <p class="description">${recipe.description}</p>
      </div>
    </section>`;
}

// =========================
//   Display Logic
// =========================

/**
 * Render an array of recipe objects into #recipe-container.
 * @param {Object[]} list
 */
function renderRecipes(list) {
  const container = document.getElementById("recipe-container");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<p class="no-results">No recipes found. Try a different keyword!</p>`;
    return;
  }

  container.innerHTML = list.map(buildCard).join("");
}

/**
 * Pick a random recipe and display it.
 */
function showRandomRecipe() {
  const randomIndex = Math.floor(Math.random() * recipes.length);
  renderRecipes([recipes[randomIndex]]);
}

// =========================
//   Search Logic
// =========================

/**
 * Filter recipes by keyword (name, description, tags) then sort by name.
 * @param {string} keyword
 */
function searchRecipes(keyword) {
  const query = keyword.trim().toLowerCase();

  if (!query) {
    showRandomRecipe();
    return;
  }

  const results = recipes
    .filter((r) => {
      const haystack = [
        r.name,
        r.description,
        ...r.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  renderRecipes(results);
}

// =========================
//   Event Listeners
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // Show a random recipe on page load
  showRandomRecipe();

  const input = document.querySelector(".search-area input");
  const button = document.querySelector(".search-area button");

  // Search on button click
  button.addEventListener("click", () => {
    searchRecipes(input.value);
  });

  // Search on Enter key
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      searchRecipes(input.value);
    }
  });

  // Live search as user types (with small debounce)
  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchRecipes(input.value);
    }, 300);
  });
});