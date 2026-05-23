const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appUHLfDMhcEKZJ4T";
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Propiedades";

exports.handler = async function handler() {
    const apiKey = process.env.AIRTABLE_API_KEY;

    if (!apiKey || !AIRTABLE_BASE_ID) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "Faltan variables de entorno AIRTABLE_API_KEY o AIRTABLE_BASE_ID en Netlify"
            })
        };
    }

    try {
        const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
        const records = [];
        let offset = null;

        do {
            const url = offset ? `${baseUrl}?offset=${encodeURIComponent(offset)}` : baseUrl;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const message = await response.text();
                return {
                    statusCode: response.status,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        error: "Error consultando Airtable",
                        details: message
                    })
                };
            }

            const data = await response.json();
            records.push(...(data.records || []));
            offset = data.offset || null;
        } while (offset);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ records })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "Error interno en la function",
                details: error.message
            })
        };
    }
};
