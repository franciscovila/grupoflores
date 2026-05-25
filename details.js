const params = new URLSearchParams(window.location.search);
const propertyId = params.get("id");
const CONTACT_WHATSAPP_NUMBER = "5492646610044";

const detailContainer = document.getElementById("propertyDetailContainer");

function escapeHtml(value) {
    if (window.SEOUtils && typeof window.SEOUtils.escapeHtml === "function") {
        return window.SEOUtils.escapeHtml(value);
    }
    return String(value || "");
}

function buildDetailImageAlt(property, index) {
    const location = property.location || "San Juan";
    if (index === 0) {
        return `${property.title} - ${property.type} en ${location}, San Juan, Argentina`;
    }
    return `Foto ${index + 1} de ${property.title} en ${location}`;
}

function renderDetailCarousel(property) {
    const photos = Array.isArray(property.photos) && property.photos.length
        ? property.photos
        : [property.image];

    const slides = photos
        .map((photo, index) => {
            const loading = index === 0 ? "eager" : "lazy";
            return `
                <img
                    src="${photo}"
                    alt="${escapeHtml(buildDetailImageAlt(property, index))}"
                    class="property-detail-slide${index === 0 ? " is-active" : ""}"
                    loading="${loading}"
                    decoding="async"
                >
            `;
        })
        .join("");

    if (photos.length === 1) {
        return `
            <div class="property-detail-carousel">
                ${slides}
            </div>
        `;
    }

    return `
        <div class="property-detail-carousel" data-current-slide="0" data-total-slides="${photos.length}">
            ${slides}
            <button class="property-detail-carousel-btn property-detail-carousel-btn-prev" type="button" data-detail-carousel-action="prev" aria-label="Foto anterior">‹</button>
            <button class="property-detail-carousel-btn property-detail-carousel-btn-next" type="button" data-detail-carousel-action="next" aria-label="Foto siguiente">›</button>
            <div class="property-detail-carousel-indicator">1 / ${photos.length}</div>
        </div>
    `;
}

function destroyDetailMap() {
    if (window.PropertyMap) {
        window.PropertyMap.destroy();
    }
}

function renderStreetViewButton(property) {
    const streetViewUrl = window.StreetViewLink
        ? window.StreetViewLink.buildUrl(property.latitude, property.longitude)
        : null;

    if (!streetViewUrl) {
        return "";
    }

    return `
        <a
            class="street-view-btn"
            href="${streetViewUrl}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver Street View de la propiedad en Google Maps"
        >
            <span class="street-view-btn__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"></path>
                    <circle cx="12" cy="9" r="1.4" fill="#f7fbfc"></circle>
                </svg>
            </span>
            <span class="street-view-btn__label">Ver en Street View</span>
            <span class="street-view-btn__chevron" aria-hidden="true">→</span>
        </a>
    `;
}

function renderPropertyMap(property) {
    if (
        !window.PropertyMap ||
        !window.PropertyMap.hasValidCoordinates(property.latitude, property.longitude)
    ) {
        return "";
    }

    return `
        <section class="property-detail-map" aria-label="Ubicacion de la propiedad">
            <h2 class="property-detail-map-title">Ubicacion</h2>
            <div id="propertyDetailMap" class="property-detail-map-container" role="region" aria-label="Mapa interactivo"></div>
            ${renderStreetViewButton(property)}
        </section>
    `;
}

function initPropertyDetailMap(property) {
    if (!window.PropertyMap) {
        return;
    }

    window.PropertyMap.init("propertyDetailMap", property.latitude, property.longitude, {
        zoom: 15,
        popupText: property.title
    });
}

function renderNotFound() {
    destroyDetailMap();
    detailContainer.innerHTML = `
        <section class="property-not-found">
            <h1>Propiedad no encontrada</h1>
            <p>La propiedad que estas buscando no esta disponible.</p>
            <a class="card-btn" href="index.html#propiedades">Volver a propiedades</a>
        </section>
    `;
}

function renderProperty(property) {
    destroyDetailMap();

    const whatsappMessage = encodeURIComponent(
        `Hola, quiero mas informacion sobre: ${property.title}`
    );

    detailContainer.innerHTML = `
        <article class="property-detail">
            <div class="property-detail-image">
                ${renderDetailCarousel(property)}
            </div>
            <div class="property-detail-content">
                <p class="property-badge">${property.type} · ${property.location}</p>
                <h1>${property.title}</h1>
                <p class="property-detail-description"><strong>Precio:</strong> ${property.price}</p>
                <p class="property-detail-description">${property.description}</p>

                <div class="property-features">
                    <div class="feature-item"><strong>Direccion:</strong> ${property.address}</div>
                    <div class="feature-item"><strong>Tipo:</strong> ${property.type}</div>
                </div>

                ${renderPropertyMap(property)}

                <div class="property-detail-actions">
                    <a class="card-btn" href="https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${whatsappMessage}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
                    <a class="back-link" href="index.html#propiedades">← Volver al listado</a>
                </div>
            </div>
        </article>
    `;

    initPropertyDetailMap(property);
}

function initDetailCarousel() {
    detailContainer.addEventListener("click", (event) => {
        const button = event.target.closest("[data-detail-carousel-action]");
        if (!button) {
            return;
        }

        const carousel = button.closest(".property-detail-carousel");
        if (!carousel) {
            return;
        }

        const slides = carousel.querySelectorAll(".property-detail-slide");
        const indicator = carousel.querySelector(".property-detail-carousel-indicator");
        const action = button.dataset.detailCarouselAction;
        const totalSlides = Number(carousel.dataset.totalSlides || slides.length);
        const currentSlide = Number(carousel.dataset.currentSlide || 0);
        const nextIndex = action === "prev"
            ? (currentSlide - 1 + totalSlides) % totalSlides
            : (currentSlide + 1) % totalSlides;

        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === nextIndex);
        });

        carousel.dataset.currentSlide = String(nextIndex);
        if (indicator) {
            indicator.textContent = `${nextIndex + 1} / ${totalSlides}`;
        }
    });
}

async function initPropertyDetails() {
    if (!detailContainer || !propertyId) {
        renderNotFound();
        return;
    }

    destroyDetailMap();
    detailContainer.innerHTML = "<p>Cargando detalle de la propiedad...</p>";
    detailContainer.setAttribute("aria-busy", "true");

    try {
        const propertiesData = await window.loadPropertiesFromAirtable();
        const property = propertiesData.find((item) => item.id === propertyId);

        if (!property) {
            renderNotFound();
            return;
        }

        renderProperty(property);

        if (window.SEOUtils) {
            window.SEOUtils.applyPropertyPageSEO(property);
        }

        if (detailContainer) {
            detailContainer.setAttribute("aria-busy", "false");
        }
    } catch (error) {
        console.error("Error al cargar detalle desde Airtable:", error);
        destroyDetailMap();
        detailContainer.innerHTML = `
            <section class="property-not-found">
                <h1>No se pudo cargar la propiedad</h1>
                <p>Intenta nuevamente en unos minutos.</p>
                <a class="card-btn" href="index.html#propiedades">Volver a propiedades</a>
            </section>
        `;
    }
}

window.addEventListener("pagehide", destroyDetailMap);

initDetailCarousel();
initPropertyDetails();
