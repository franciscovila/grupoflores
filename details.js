const params = new URLSearchParams(window.location.search);
const propertyId = params.get("id");
const CONTACT_WHATSAPP_NUMBER = "5492646610044";

const detailContainer = document.getElementById("propertyDetailContainer");

function renderDetailCarousel(property) {
    const photos = Array.isArray(property.photos) && property.photos.length
        ? property.photos
        : [property.image];

    const slides = photos
        .map((photo, index) => {
            return `
                <img
                    src="${photo}"
                    alt="${property.title}"
                    class="property-detail-slide${index === 0 ? " is-active" : ""}"
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

function renderNotFound() {
    detailContainer.innerHTML = `
        <section class="property-not-found">
            <h1>Propiedad no encontrada</h1>
            <p>La propiedad que estas buscando no esta disponible.</p>
            <a class="card-btn" href="index.html#propiedades">Volver a propiedades</a>
        </section>
    `;
}

function renderProperty(property) {
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

                <div class="property-detail-actions">
                    <a class="card-btn" href="https://wa.me/${CONTACT_WHATSAPP_NUMBER}?text=${whatsappMessage}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
                    <a class="back-link" href="index.html#propiedades">← Volver al listado</a>
                </div>
            </div>
        </article>
    `;
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

    detailContainer.innerHTML = "<p>Cargando detalle de la propiedad...</p>";

    try {
        const propertiesData = await window.loadPropertiesFromAirtable();
        const property = propertiesData.find((item) => item.id === propertyId);

        if (!property) {
            renderNotFound();
            return;
        }

        renderProperty(property);
    } catch (error) {
        console.error("Error al cargar detalle desde Airtable:", error);
        detailContainer.innerHTML = `
            <section class="property-not-found">
                <h1>No se pudo cargar la propiedad</h1>
                <p>Intenta nuevamente en unos minutos.</p>
                <a class="card-btn" href="index.html#propiedades">Volver a propiedades</a>
            </section>
        `;
    }
}

initDetailCarousel();
initPropertyDetails();
