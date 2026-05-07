// BOTON HERO
const btnHero = document.getElementById("btnHero");

btnHero.addEventListener("click", () => {
    document.getElementById("propiedades").scrollIntoView({
        behavior: "smooth"
    });
});

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
const propertiesData = window.PROPERTIES_DATA || [];

const cardsContainer = document.querySelector(".cards");

cardsContainer.innerHTML = propertiesData
    .map((property) => {
        return `
            <div class="card">
                <img src="${property.image}" alt="${property.type}">
                <div class="card-content">
                    <h3>${property.title}</h3>
                    <p>${property.type} · ${property.location}</p>
                    <span>${property.description}</span>
                    <a class="card-btn" href="details.html?id=${property.id}">Consultar esta propiedad</a>
                </div>
            </div>
        `;
    })
    .join("");

// FORMULARIO
const form = document.getElementById("contactForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Gracias por tu consulta. Te contactaremos a la brevedad.");
    form.reset();
});