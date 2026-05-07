const params = new URLSearchParams(window.location.search);
const propertyId = params.get("id");

const propertiesData = window.PROPERTIES_DATA || [];
const property = propertiesData.find((item) => item.id === propertyId);
const detailContainer = document.getElementById("propertyDetailContainer");

if (!property) {
    detailContainer.innerHTML = `
        <section class="property-not-found">
            <h1>Propiedad no encontrada</h1>
            <p>La propiedad que estas buscando no esta disponible.</p>
            <a class="card-btn" href="index.html#propiedades">Volver a propiedades</a>
        </section>
    `;
} else {
    const whatsappMessage = encodeURIComponent(
        `Hola, quiero mas informacion sobre: ${property.title}`
    );

    detailContainer.innerHTML = `
        <article class="property-detail">
            <div class="property-detail-image">
                <img src="${property.image}" alt="${property.title}">
            </div>
            <div class="property-detail-content">
                <p class="property-badge">${property.type} · ${property.location}</p>
                <h1>${property.title}</h1>
                <p class="property-detail-description">${property.description}</p>
                <p class="property-detail-description">${property.details}</p>

                <div class="property-features">
                    <div class="feature-item"><strong>Dormitorios:</strong> ${property.bedrooms}</div>
                    <div class="feature-item"><strong>Banos:</strong> ${property.bathrooms}</div>
                    <div class="feature-item"><strong>Superficie:</strong> ${property.area}</div>
                    <div class="feature-item"><strong>Direccion:</strong> ${property.address}</div>
                </div>

                <div class="property-detail-actions">
                    <a class="card-btn" href="https://wa.me/5490000000000?text=${whatsappMessage}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
                    <a class="back-link" href="index.html#propiedades">← Volver al listado</a>
                </div>
            </div>
        </article>
    `;
}
