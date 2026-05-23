window.addEventListener("scroll", () => {
    const hero = document.querySelector(".hero");
    if (!hero) {
        return;
    }

    const rect = hero.getBoundingClientRect();
    const offset = Math.max(0, -rect.top);
    document.documentElement.style.setProperty("--hero-offset", `${offset}px`);
});

// PROPIEDADES
const cardsContainer = document.querySelector(".cards");
const searchForm = document.getElementById("searchForm");
const operationTypeSelect = document.getElementById("operationType");
const propertyTypeSelect = document.getElementById("propertyType");
const priceRangeMinInput = document.getElementById("priceRangeMin");
const priceRangeMaxInput = document.getElementById("priceRangeMax");
const priceValueLabel = document.getElementById("priceValue");
const rangeDouble = document.querySelector(".range-double");
let allProperties = [];
let currentPriceMin = 0;
let currentPriceMax = 0;

function escapeHtml(value) {
    if (window.SEOUtils && typeof window.SEOUtils.escapeHtml === "function") {
        return window.SEOUtils.escapeHtml(value);
    }
    return String(value || "");
}

function buildPropertyImageAlt(property, index) {
    const location = property.location || "San Juan";
    const operation = property.operationType || "Venta o alquiler";
    if (index === 0) {
        return `${property.title} - ${property.type} en ${location}, San Juan, Argentina (${operation})`;
    }
    return `Foto ${index + 1} de ${property.title} en ${location}, San Juan`;
}

function renderCarousel(property) {
    const photos = Array.isArray(property.photos) && property.photos.length
        ? property.photos
        : [property.image];

    const slides = photos
        .map((photo, index) => {
            const loading = index === 0 ? "eager" : "lazy";
            return `
                <img
                    src="${photo}"
                    alt="${escapeHtml(buildPropertyImageAlt(property, index))}"
                    class="card-slide${index === 0 ? " is-active" : ""}"
                    data-slide-index="${index}"
                    loading="${loading}"
                    decoding="async"
                >
            `;
        })
        .join("");

    if (photos.length === 1) {
        return `
            <div class="card-carousel">
                ${slides}
            </div>
        `;
    }

    return `
        <div class="card-carousel" data-current-slide="0" data-total-slides="${photos.length}">
            ${slides}
            <button class="carousel-btn carousel-btn-prev" type="button" data-carousel-action="prev" aria-label="Foto anterior">‹</button>
            <button class="carousel-btn carousel-btn-next" type="button" data-carousel-action="next" aria-label="Foto siguiente">›</button>
            <div class="carousel-indicator">${1} / ${photos.length}</div>
        </div>
    `;
}

function renderProperties(propertiesData) {
    if (!cardsContainer) {
        return;
    }

    cardsContainer.setAttribute("aria-busy", "true");

    if (!propertiesData.length) {
        cardsContainer.innerHTML = "<p>No hay propiedades para los filtros seleccionados.</p>";
        cardsContainer.setAttribute("aria-busy", "false");
        return;
    }

    cardsContainer.innerHTML = propertiesData
        .map((property) => {
            const propertyUrl = `details.html?id=${encodeURIComponent(property.id)}`;
            return `
                <article class="card" role="listitem">
                    ${renderCarousel(property)}
                    <div class="card-content">
                        <h3>${escapeHtml(property.title)}</h3>
                        <p>${escapeHtml(property.operationType)} · ${escapeHtml(property.type)} en San Juan</p>
                        <p><strong>${escapeHtml(property.price)}</strong></p>
                        <span class="card-description">${escapeHtml(property.description)}</span>
                        <a class="card-btn" href="${propertyUrl}">Consultar esta propiedad</a>
                    </div>
                </article>
            `;
        })
        .join("");

    cardsContainer.setAttribute("aria-busy", "false");
}

function formatCurrency(value) {
    return `$ ${Number(value || 0).toLocaleString("es-AR")}`;
}

function updateRangeTrackVisual() {
    if (!rangeDouble) {
        return;
    }

    const min = Number(priceRangeMinInput.min || 0);
    const max = Number(priceRangeMinInput.max || 0);
    const selectedMin = Number(priceRangeMinInput.value || 0);
    const selectedMax = Number(priceRangeMaxInput.value || 0);
    const total = max - min;

    if (total <= 0) {
        rangeDouble.style.background = "#d9e5e8";
        return;
    }

    const start = ((selectedMin - min) / total) * 100;
    const end = ((selectedMax - min) / total) * 100;
    rangeDouble.style.background = `linear-gradient(to right, #d9e5e8 0%, #d9e5e8 ${start}%, #4b5960 ${start}%, #4b5960 ${end}%, #d9e5e8 ${end}%, #d9e5e8 100%)`;
}

function updateRangeThumbPriority() {
    const minValue = Number(priceRangeMinInput.value || 0);
    const maxValue = Number(priceRangeMaxInput.value || 0);

    if (minValue >= maxValue) {
        priceRangeMinInput.style.zIndex = "4";
        priceRangeMaxInput.style.zIndex = "3";
        return;
    }

    priceRangeMinInput.style.zIndex = "2";
    priceRangeMaxInput.style.zIndex = "3";
}

function populateSelect(select, values) {
    const uniqueValues = Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
    if (!uniqueValues.length) {
        select.innerHTML = "";
        select.disabled = true;
        return;
    }

    select.disabled = false;
    select.innerHTML = uniqueValues.map((value) => `<option value="${value}">${value}</option>`).join("");
    select.value = uniqueValues[0];
}

function setupFilters(propertiesData) {
    populateSelect(propertyTypeSelect, propertiesData.map((item) => item.type));
}

function getBaseFilteredProperties() {
    const selectedOperationType = operationTypeSelect.value.toLowerCase();
    const selectedPropertyType = propertyTypeSelect.value;

    return allProperties.filter((property) => {
        const propertyOperation = String(property.operationType || "").toLowerCase();
        const matchesOperation = propertyOperation === selectedOperationType;
        const matchesType = property.type === selectedPropertyType;
        return matchesOperation && matchesType;
    });
}

function updatePriceRangeFromFilters(resetValue = false) {
    const baseFiltered = getBaseFilteredProperties();

    if (!baseFiltered.length) {
        currentPriceMin = 0;
        currentPriceMax = 0;
        priceRangeMinInput.min = "0";
        priceRangeMinInput.max = "0";
        priceRangeMinInput.value = "0";
        priceRangeMinInput.disabled = true;
        priceRangeMaxInput.min = "0";
        priceRangeMaxInput.max = "0";
        priceRangeMaxInput.value = "0";
        priceRangeMaxInput.disabled = true;
        priceValueLabel.textContent = "Sin resultados para ese filtro";
        updateRangeTrackVisual();
        return;
    }

    currentPriceMin = Math.min(...baseFiltered.map((item) => item.priceValue || 0));
    currentPriceMax = Math.max(...baseFiltered.map((item) => item.priceValue || 0));

    priceRangeMinInput.disabled = false;
    priceRangeMaxInput.disabled = false;
    priceRangeMinInput.min = String(currentPriceMin);
    priceRangeMinInput.max = String(currentPriceMax);
    priceRangeMinInput.step = "1000";
    priceRangeMaxInput.min = String(currentPriceMin);
    priceRangeMaxInput.max = String(currentPriceMax);
    priceRangeMaxInput.step = "1000";

    const currentMinValue = Number(priceRangeMinInput.value || 0);
    const currentMaxValue = Number(priceRangeMaxInput.value || 0);
    if (resetValue || currentMinValue < currentPriceMin || currentMinValue > currentPriceMax) {
        priceRangeMinInput.value = String(currentPriceMin);
    }
    if (resetValue || currentMaxValue < currentPriceMin || currentMaxValue > currentPriceMax) {
        priceRangeMaxInput.value = String(currentPriceMax);
    }

    if (Number(priceRangeMinInput.value) > Number(priceRangeMaxInput.value)) {
        priceRangeMinInput.value = String(currentPriceMin);
        priceRangeMaxInput.value = String(currentPriceMax);
    }

    priceValueLabel.textContent = `${formatCurrency(priceRangeMinInput.value)} - ${formatCurrency(priceRangeMaxInput.value)}`;
    updateRangeTrackVisual();
    updateRangeThumbPriority();
}

function applyFilters() {
    const selectedMinPrice = Number(priceRangeMinInput.value || 0);
    const selectedMaxPrice = Number(priceRangeMaxInput.value || 0);

    const filtered = getBaseFilteredProperties().filter((property) => {
        const price = property.priceValue || 0;
        return price >= selectedMinPrice && price <= selectedMaxPrice;
    });

    renderProperties(filtered);
}

function updateCarousel(carousel, nextIndex) {
    const slides = carousel.querySelectorAll(".card-slide");
    const totalSlides = Number(carousel.dataset.totalSlides || slides.length);
    const indicator = carousel.querySelector(".carousel-indicator");

    slides.forEach((slide, index) => {
        slide.classList.toggle("is-active", index === nextIndex);
    });

    carousel.dataset.currentSlide = String(nextIndex);
    if (indicator) {
        indicator.textContent = `${nextIndex + 1} / ${totalSlides}`;
    }
}

function initCarousels() {
    cardsContainer.addEventListener("click", (event) => {
        const button = event.target.closest("[data-carousel-action]");
        if (!button) {
            return;
        }

        const carousel = button.closest(".card-carousel");
        if (!carousel) {
            return;
        }

        const action = button.dataset.carouselAction;
        const currentSlide = Number(carousel.dataset.currentSlide || 0);
        const totalSlides = Number(carousel.dataset.totalSlides || 1);

        const nextIndex = action === "prev"
            ? (currentSlide - 1 + totalSlides) % totalSlides
            : (currentSlide + 1) % totalSlides;

        updateCarousel(carousel, nextIndex);
    });
}

async function initProperties() {
    if (!cardsContainer) {
        return;
    }

    cardsContainer.innerHTML = "<p>Cargando propiedades...</p>";
    cardsContainer.setAttribute("aria-busy", "true");

    try {
        allProperties = await window.loadPropertiesFromAirtable();
        if (!allProperties.length) {
            cardsContainer.innerHTML = "<p>No hay propiedades disponibles por ahora.</p>";
            cardsContainer.setAttribute("aria-busy", "false");
            return;
        }

        setupFilters(allProperties);
        updatePriceRangeFromFilters(true);
        applyFilters();
    } catch (error) {
        console.error("Error al cargar propiedades desde Airtable:", error);
        cardsContainer.innerHTML = "<p>No se pudieron cargar las propiedades. Intenta nuevamente.</p>";
        cardsContainer.setAttribute("aria-busy", "false");
    }
}

initProperties();
initCarousels();

if (priceRangeMinInput && priceRangeMaxInput && priceValueLabel) {
    priceRangeMinInput.addEventListener("input", () => {
        if (Number(priceRangeMinInput.value) > Number(priceRangeMaxInput.value)) {
            priceRangeMinInput.value = priceRangeMaxInput.value;
        }
        priceValueLabel.textContent = `${formatCurrency(priceRangeMinInput.value)} - ${formatCurrency(priceRangeMaxInput.value)}`;
        updateRangeTrackVisual();
        updateRangeThumbPriority();
    });

    priceRangeMaxInput.addEventListener("input", () => {
        if (Number(priceRangeMaxInput.value) < Number(priceRangeMinInput.value)) {
            priceRangeMaxInput.value = priceRangeMinInput.value;
        }
        priceValueLabel.textContent = `${formatCurrency(priceRangeMinInput.value)} - ${formatCurrency(priceRangeMaxInput.value)}`;
        updateRangeTrackVisual();
        updateRangeThumbPriority();
    });
}

if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        applyFilters();
        document.getElementById("propiedades").scrollIntoView({
            behavior: "smooth"
        });
    });
}

if (operationTypeSelect) {
    operationTypeSelect.addEventListener("change", () => {
        updatePriceRangeFromFilters(true);
    });
}

if (propertyTypeSelect) {
    propertyTypeSelect.addEventListener("change", () => {
        updatePriceRangeFromFilters(true);
    });
}

// FORMULARIO
const form = document.getElementById("contactForm");

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Gracias por tu consulta. Te contactaremos a la brevedad.");
        form.reset();
    });
}