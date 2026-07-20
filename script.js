/* ==========================================
   LEXORA DICTIONARY
   PART 1
========================================== */
console.log("hello");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const result = document.getElementById("result");
const loader = document.getElementById("loader");
const errorCard = document.getElementById("errorCard");

const wordElement = document.getElementById("word");
const phoneticElement = document.getElementById("phonetic");
const meaningsElement = document.getElementById("meanings");
const synonymsElement = document.getElementById("synonyms");

const favBtn = document.getElementById("favBtn");

const API =
    "https://api.dictionaryapi.dev/api/v2/entries/en/";

let currentWord = "";

let currentData = null;

/* ==========================================
   UI
========================================== */

function showLoader() {

    loader.classList.remove("hidden");

    result.classList.add("hidden");

    errorCard.classList.add("hidden");

}

function hideLoader() {

    loader.classList.add("hidden");

}

function showResult() {

    result.classList.remove("hidden");

    errorCard.classList.add("hidden");

}

function showError() {

    result.classList.add("hidden");

    errorCard.classList.remove("hidden");

}

/* ==========================================
   SEARCH
========================================== */

async function searchWord(word) {

    word = word.trim().toLowerCase();

    if (!word) return;

    currentWord = word;

    showLoader();

    try {

        const response = await fetch(API + word);

        if (!response.ok) {

            throw new Error("Word not found");

        }

        const data = await response.json();

        currentData = data[0];

        renderWord(currentData);

        saveHistory(word);

        updateFavoriteButton();

        showResult();

    }

    catch (error) {

        showError();

        console.log(error);

    }

    finally {

        hideLoader();

    }

}

/* ==========================================
   RENDER
========================================== */

function renderWord(data) {

    wordElement.textContent =
        data.word || "";

    phoneticElement.textContent =
        data.phonetic || "";

    renderMeanings(data.meanings);

    renderSynonyms(data.meanings);

}

/* ==========================================
   MEANINGS
========================================== */

function renderMeanings(meanings) {

    meaningsElement.innerHTML = "";

    meanings.forEach((meaning) => {

        const card =
            document.createElement("div");

        card.className = "meaning";

        let html = `

            <h3>

                ${meaning.partOfSpeech}

            </h3>

        `;

        meaning.definitions.forEach((definition) => {

            html += `

                <p class="definition">

                    ${definition.definition}

                </p>

            `;

            if (definition.example) {

                html += `

                    <p class="example">

                        "${definition.example}"

                    </p>

                `;

            }

        });

        card.innerHTML = html;

        meaningsElement.appendChild(card);

    });

}

/* ==========================================
   SYNONYMS
========================================== */

function renderSynonyms(meanings) {

    synonymsElement.innerHTML = "";

    const set =
        new Set();

    meanings.forEach((meaning) => {

        if (!meaning.synonyms) return;

        meaning.synonyms.forEach((item) => {

            set.add(item);

        });

    });

    if (set.size === 0) {

        synonymsElement.innerHTML =

            "<span>No synonyms available</span>";

        return;

    }

    [...set]
        .slice(0, 20)
        .forEach((word) => {

            const chip =
                document.createElement("span");

            chip.textContent = word;

            chip.onclick = () => {

                searchInput.value = word;

                searchWord(word);

            };

            synonymsElement.appendChild(chip);

        });

}

/* ==========================================
   SEARCH EVENTS
========================================== */

searchBtn.addEventListener("click", () => {

    searchWord(searchInput.value);

});

searchInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        searchWord(searchInput.value);

    }

});

/* ==========================================
   PART 2
   FAVORITES • HISTORY • THEME
========================================== */

const historyBox = document.getElementById("history");
const favoritesBox = document.getElementById("favorites");
const themeBtn = document.getElementById("themeBtn");

/* ==========================================
   LOCAL STORAGE
========================================== */

let favorites =
    JSON.parse(localStorage.getItem("lexoraFavorites")) || [];

let history =
    JSON.parse(localStorage.getItem("lexoraHistory")) || [];

/* ==========================================
   SAVE FAVORITES
========================================== */

function saveFavorites() {

    localStorage.setItem(

        "lexoraFavorites",

        JSON.stringify(favorites)

    );

}

/* ==========================================
   SAVE HISTORY
========================================== */

function saveHistory(word) {

    history = history.filter(

        item => item !== word

    );

    history.unshift(word);

    history = history.slice(0, 10);

    localStorage.setItem(

        "lexoraHistory",

        JSON.stringify(history)

    );

    renderHistory();

}

/* ==========================================
   FAVORITE BUTTON
========================================== */

function updateFavoriteButton() {

    if (!currentWord) return;

    const icon =
        favBtn.querySelector("i");

    if (favorites.includes(currentWord)) {

        favBtn.classList.add("active");

        icon.className =
            "fa-solid fa-heart";

    }

    else {

        favBtn.classList.remove("active");

        icon.className =
            "fa-regular fa-heart";

    }

}

/* ==========================================
   TOGGLE FAVORITE
========================================== */

favBtn.addEventListener("click", () => {

    if (!currentWord) return;

    if (favorites.includes(currentWord)) {

        favorites = favorites.filter(

            item => item !== currentWord

        );

        showToast("Removed from Favorites");

    }

    else {

        favorites.unshift(currentWord);

        showToast("Added to Favorites");

    }

    saveFavorites();

    renderFavorites();

    updateFavoriteButton();

});

/* ==========================================
   RENDER FAVORITES
========================================== */

function renderFavorites() {

    favoritesBox.innerHTML = "";

    if (favorites.length === 0) {

        favoritesBox.innerHTML =

            `<p class="empty">

                No favorites yet.

            </p>`;

        return;

    }

    favorites.forEach(word => {

        const item =
            document.createElement("div");

        item.className =
            "favorite-item";

        item.textContent =
            word;

        item.onclick = () => {

            searchInput.value = word;

            searchWord(word);

        };

        favoritesBox.appendChild(item);

    });

}

/* ==========================================
   RENDER HISTORY
========================================== */

function renderHistory() {

    historyBox.innerHTML = "";

    if (history.length === 0) {

        historyBox.innerHTML =

            `<p class="empty">

                Nothing searched yet.

            </p>`;

        return;

    }

    history.forEach(word => {

        const item =
            document.createElement("div");

        item.className =
            "history-item";

        item.textContent =
            word;

        item.onclick = () => {

            searchInput.value = word;

            searchWord(word);

        };

        historyBox.appendChild(item);

    });

}

/* ==========================================
   THEME
========================================== */

function loadTheme() {

    const savedTheme =

        localStorage.getItem(

            "lexoraTheme"

        );

    if (savedTheme === "light") {

        document.body.classList.add(

            "light"

        );

        themeBtn.innerHTML =

            `<i class="fa-solid fa-sun"></i>`;

    }

}

loadTheme();

/* ==========================================
   TOGGLE THEME
========================================== */

themeBtn.addEventListener(

    "click",

    () => {

        document.body.classList.toggle(

            "light"

        );

        const isLight =

            document.body.classList.contains(

                "light"

            );

        localStorage.setItem(

            "lexoraTheme",

            isLight

                ? "light"

                : "dark"

        );

        themeBtn.innerHTML =

            isLight

                ? `<i class="fa-solid fa-sun"></i>`

                : `<i class="fa-solid fa-moon"></i>`;

    }

);

/* ==========================================
   INITIAL RENDER
========================================== */

renderFavorites();

renderHistory();

/* ==========================================
   PART 3
   TOAST • UTILITIES • INIT
========================================== */

const toast = document.getElementById("toast");

/* ==========================================
   TOAST
========================================== */

let toastTimer = null;

function showToast(message) {

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

/* ==========================================
   DEBOUNCE
========================================== */

function debounce(callback, delay = 500) {

    let timeout;

    return (...args) => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

/* ==========================================
   LIVE SEARCH
========================================== */

const liveSearch = debounce(() => {

    const value = searchInput.value.trim();

    if (value.length >= 3) {

        searchWord(value);

    }

}, 600);

searchInput.addEventListener("input", liveSearch);

/* ==========================================
   ANIMATE RESULT
========================================== */

function animateResult() {

    result.style.animation = "none";

    result.offsetHeight;

    result.style.animation = "fadeUp .6s ease";

}

/* ==========================================
   PATCH RENDER FUNCTION
========================================== */

const originalRenderWord = renderWord;

renderWord = function (data) {

    originalRenderWord(data);

    animateResult();

};

/* ==========================================
   ESC TO CLEAR
========================================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        searchInput.value = "";

        searchInput.focus();

    }

});

/* ==========================================
   AUTO FOCUS
========================================== */

window.addEventListener("load", () => {

    searchInput.focus();

});

/* ==========================================
   CLICK SYNONYM SEARCH
========================================== */

document.addEventListener("click", (event) => {

    if (event.target.matches("#synonyms span")) {

        const word = event.target.textContent;

        searchInput.value = word;

        searchWord(word);

    }

});

/* ==========================================
   FIRST LOAD
========================================== */

window.addEventListener("DOMContentLoaded", () => {

    if (history.length > 0) {

        searchInput.value = history[0];

        searchWord(history[0]);

    } else {

        searchInput.value = "dictionary";

        searchWord("dictionary");

    }

});

/* ==========================================
   SMOOTH CARD HOVER
========================================== */

document.querySelectorAll(".glass, .card").forEach((card) => {

    card.addEventListener("mousemove", (event) => {

        const rect = card.getBoundingClientRect();

        const x = event.clientX - rect.left;

        const y = event.clientY - rect.top;

        card.style.background = `radial-gradient(circle at ${x}px ${y}px,
            rgba(255,255,255,.14),
            var(--glass))`;

    });

    card.addEventListener("mouseleave", () => {

        card.style.background = "var(--glass)";

    });

});

/* ==========================================
   SHORTCUT
========================================== */

document.addEventListener("keydown", (event) => {

    if (event.ctrlKey && event.key.toLowerCase() === "k") {

        event.preventDefault();

        searchInput.focus();

        searchInput.select();

    }

});

/* ==========================================
   VERSION
========================================== */

console.log("Lexora Dictionary v1.0");

/* ==========================================
   END
========================================== */ 