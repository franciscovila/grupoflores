/**
 * URL principal del sitio (única fuente de verdad).
 * Usada por SEO, sitemap, canonical, Open Graph y JSON-LD.
 */
const SITE_URL = "https://grupofloresinmobiliaria.netlify.app";

if (typeof window !== "undefined") {
    window.SITE_URL = SITE_URL;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { SITE_URL };
}
