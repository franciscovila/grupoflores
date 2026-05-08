exports.handler = async function handler() {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "Propiedades";

    if (!apiKey || !baseId) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "Faltan variables de entorno AIRTABLE_API_KEY o AIRTABLE_BASE_ID"
            })
        };
    }

    try {
        const baseUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
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
