const { SITE_URL } = require("../../site-constants");

function slugify(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function pickField(fields, keys, fallback = "") {
    const normalized = {};
    Object.entries(fields || {}).forEach(([key, value]) => {
        normalized[key.trim().toLowerCase()] = value;
    });

    for (const key of keys) {
        const value = normalized[key.trim().toLowerCase()];
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return fallback;
}

function getPropertyId(record) {
    const fields = record.fields || {};
    const title = pickField(fields, ["nombre", "title", "titulo"], "propiedad");
    return pickField(fields, ["id", "slug"], `${record.id}-${slugify(title)}`);
}

function xmlEscape(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

async function fetchPropertyRecords() {
    const response = await fetch(`${SITE_URL}/.netlify/functions/properties`);

    if (!response.ok) {
        return [];
    }

    const data = await response.json();
    return data.records || [];
}

exports.handler = async function handler() {
    const staticUrls = [
        { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
        { loc: `${SITE_URL}/nosotros.html`, changefreq: "monthly", priority: "0.8" },
        { loc: `${SITE_URL}/propietarios.html`, changefreq: "monthly", priority: "0.85" }
    ];

    let propertyUrls = [];

    try {
        const records = await fetchPropertyRecords();
        propertyUrls = records.map((record) => ({
            loc: `${SITE_URL}/details.html?id=${encodeURIComponent(getPropertyId(record))}`,
            changefreq: "weekly",
            priority: "0.7"
        }));
    } catch (error) {
        console.error("sitemap: error cargando propiedades", error);
    }

    const urls = [...staticUrls, ...propertyUrls];
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (item) => `  <url>
    <loc>${xmlEscape(item.loc)}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600"
        },
        body
    };
};
