/**
 * Configuración SEO centralizada.
 * siteUrl se toma de site-constants.js (SITE_URL).
 */
window.SEO_CONFIG = {
    siteUrl: window.SITE_URL || "https://grupofloresinmobiliaria.netlify.app",
    siteName: "Grupo Flores Inmobiliaria",
    defaultLocale: "es_AR",
    business: {
        legalName: "Grupo Flores Servicios Inmobiliarios",
        telephone: "+542646610044",
        email: "martillero.cflores@hotmail.com",
        streetAddress: "Aberastain 114 Sur",
        addressLocality: "Santa Lucía",
        addressRegion: "San Juan",
        postalCode: "5411",
        addressCountry: "AR",
        latitude: -31.662,
        longitude: -68.493,
        openingHours: "Mo-Fr 09:00-18:00",
        priceRange: "$$",
        whatsapp: "5492646610044"
    },
    defaultImage: "/images/logo.jpg",
    pages: {
        home: {
            path: "",
            title: "Inmobiliaria en San Juan | Grupo Flores - Venta y Alquiler",
            description:
                "Grupo Flores: inmobiliaria en San Juan, Argentina. Casas, departamentos y terrenos en venta y alquiler con asesoramiento profesional y corredor matriculado.",
            ogType: "website"
        },
        nosotros: {
            path: "nosotros.html",
            title: "Nosotros | Inmobiliaria Grupo Flores en San Juan",
            description:
                "Conocé la misión de Grupo Flores: servicio inmobiliario cercano, transparente y profesional en San Juan, Argentina. Proyecto familiar con corredor matriculado.",
            ogType: "website"
        },
        propietarios: {
            path: "propietarios.html",
            title: "¿Sos Propietario? | Tasar, Alquilar y Vender en San Juan",
            description:
                "Tasá, alquilá o vendé tu propiedad en San Juan con Grupo Flores. Corredor matriculado Nº150 CPCISJ. Tasación profesional, administración y venta con respaldo.",
            ogType: "website"
        },
        details: {
            path: "details.html",
            title: "Propiedad en San Juan | Grupo Flores Inmobiliaria",
            description:
                "Detalle de propiedad en venta o alquiler en San Juan, Argentina. Consultá con Grupo Flores Inmobiliaria por WhatsApp.",
            ogType: "website"
        }
    }
};
