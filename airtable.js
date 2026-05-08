const AIRTABLE_BASE_ID = "appUHLfDMhcEKZJ4T";
const AIRTABLE_TABLE_NAME = "Propiedades";

function slugify(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function normalizeKey(text) {
    return String(text || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function getNormalizedFields(fields) {
    const normalized = {};
    Object.entries(fields || {}).forEach(([key, value]) => {
        normalized[normalizeKey(key)] = value;
    });
    return normalized;
}

function pickField(fields, possibleKeys, fallback = "") {
    const normalizedFields = getNormalizedFields(fields);
    for (const key of possibleKeys) {
        const normalizedKey = normalizeKey(key);
        const value = normalizedFields[normalizedKey];
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return fallback;
}

function getFirstPhotoUrl(value, fallback) {
    if (!value) {
        return fallback;
    }

    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value) && value.length) {
        const firstItem = value[0];
        if (typeof firstItem === "string") {
            return firstItem;
        }
        if (firstItem && typeof firstItem === "object" && firstItem.url) {
            return firstItem.url;
        }
    }

    return fallback;
}

function getPhotoUrls(value) {
    if (!value) {
        return [];
    }

    if (typeof value === "string") {
        return [value];
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => {
                if (typeof item === "string") {
                    return item;
                }
                if (item && typeof item === "object" && item.url) {
                    return item.url;
                }
                return null;
            })
            .filter(Boolean);
    }

    return [];
}

function parsePrice(value) {
    if (typeof value === "number") {
        return value;
    }

    const numeric = String(value || "").replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number(numeric);
    return Number.isFinite(parsed) ? parsed : 0;
}

function mapRecordToProperty(record) {
    const fields = record.fields || {};
    const title = pickField(
        fields,
        ["nombre", "title", "titulo"],
        "Propiedad sin titulo"
    );
    const photos = pickField(fields, ["fotos", "images", "image", "imagen"], []);
    const description = pickField(
        fields,
        ["descripcion", "description", "detalle", "details"],
        "Sin descripcion disponible."
    );
    const photoUrls = getPhotoUrls(photos);

    return {
        id: pickField(fields, ["id", "slug"], `${record.id}-${slugify(title)}`),
        title,
        type: pickField(
            fields,
            ["tipo de propiedad", "tipo", "type"],
            "Propiedad"
        ),
        operationType: pickField(
            fields,
            ["tipo de operacion", "tipo operacion", "operacion", "operation type"],
            "Sin especificar"
        ),
        location: pickField(fields, ["location", "ubicacion"], "San Juan"),
        address: pickField(fields, ["direccion", "address"], "A consultar"),
        price: pickField(fields, ["precio", "price"], "A consultar"),
        priceValue: parsePrice(pickField(fields, ["precio", "price"], "0")),
        description,
        details: description,
        image: getFirstPhotoUrl(photos, "images/logo.jpg"),
        photos: photoUrls.length ? photoUrls : ["images/logo.jpg"]
    };
}

async function loadPropertiesFromAirtable() {
    try {
        const response = await fetch("/.netlify/functions/properties");
        if (!response.ok) {
            throw new Error(`Function respondio con estado ${response.status}`);
        }

        const data = await response.json();
        const records = data.records || [];
        return records.map(mapRecordToProperty);
    } catch (error) {
        const localApiKey = window.AIRTABLE_API_KEY;
        if (!localApiKey) {
            throw error;
        }

        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
        let allRecords = [];
        let offset = null;

        do {
            const response = await fetch(offset ? `${url}?offset=${offset}` : url, {
                headers: {
                    Authorization: `Bearer ${localApiKey}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Airtable respondio con estado ${response.status}`);
            }

            const data = await response.json();
            allRecords = allRecords.concat(data.records || []);
            offset = data.offset || null;
        } while (offset);

        return allRecords.map(mapRecordToProperty);
    }
}

window.loadPropertiesFromAirtable = loadPropertiesFromAirtable;
