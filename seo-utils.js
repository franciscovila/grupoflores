(function () {
    function getConfig() {
        return window.SEO_CONFIG || {};
    }

    function getSiteUrl() {
        const fromConstant =
            typeof window !== "undefined" && window.SITE_URL ? window.SITE_URL : "";
        const fromConfig = getConfig().siteUrl || "";
        return String(fromConstant || fromConfig).replace(/\/$/, "");
    }

    function toAbsoluteUrl(pathOrUrl) {
        if (!pathOrUrl) {
            return getSiteUrl();
        }
        if (/^https?:\/\//i.test(pathOrUrl)) {
            return pathOrUrl;
        }
        const base = getSiteUrl();
        const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
        return `${base}${path}`;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setMetaByName(name, content) {
        if (!content) {
            return;
        }
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute("name", name);
            document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
    }

    function setMetaByProperty(property, content) {
        if (!content) {
            return;
        }
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute("property", property);
            document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
    }

    function setCanonical(url) {
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement("link");
            link.setAttribute("rel", "canonical");
            document.head.appendChild(link);
        }
        link.setAttribute("href", url);
    }

    function setJsonLd(id, data) {
        let script = document.getElementById(id);
        if (!script) {
            script = document.createElement("script");
            script.type = "application/ld+json";
            script.id = id;
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(data);
    }

    function buildOrganizationSchema() {
        const config = getConfig();
        const business = config.business || {};

        return {
            "@context": "https://schema.org",
            "@type": ["RealEstateAgent", "LocalBusiness"],
            "@id": `${getSiteUrl()}/#organization`,
            name: config.siteName,
            legalName: business.legalName || config.siteName,
            url: getSiteUrl(),
            image: toAbsoluteUrl(config.defaultImage),
            logo: toAbsoluteUrl(config.defaultImage),
            telephone: business.telephone,
            email: business.email,
            priceRange: business.priceRange || "$$",
            address: {
                "@type": "PostalAddress",
                streetAddress: business.streetAddress,
                addressLocality: business.addressLocality,
                addressRegion: business.addressRegion,
                postalCode: business.postalCode,
                addressCountry: business.addressCountry
            },
            geo: {
                "@type": "GeoCoordinates",
                latitude: business.latitude,
                longitude: business.longitude
            },
            areaServed: [
                {
                    "@type": "City",
                    name: "San Juan",
                    containedInPlace: {
                        "@type": "Country",
                        name: "Argentina"
                    }
                },
                {
                    "@type": "AdministrativeArea",
                    name: "Provincia de San Juan"
                }
            ],
            openingHoursSpecification: [
                {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    opens: "09:00",
                    closes: "18:00"
                }
            ],
            sameAs: business.whatsapp
                ? [`https://wa.me/${business.whatsapp}`]
                : undefined
        };
    }

    function buildWebsiteSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${getSiteUrl()}/#website`,
            url: getSiteUrl(),
            name: getConfig().siteName,
            inLanguage: "es-AR",
            publisher: {
                "@id": `${getSiteUrl()}/#organization`
            }
        };
    }

    function buildPropertyListingSchema(property) {
        const config = getConfig();
        const image = property.image || config.defaultImage;
        const schema = {
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: property.title,
            description: property.description,
            url: `${getSiteUrl()}/details.html?id=${encodeURIComponent(property.id)}`,
            image: toAbsoluteUrl(image),
            address: {
                "@type": "PostalAddress",
                streetAddress: property.address || config.business?.streetAddress,
                addressLocality: property.location || "San Juan",
                addressRegion: "San Juan",
                addressCountry: "AR"
            }
        };

        if (property.price && property.price !== "A consultar") {
            schema.offers = {
                "@type": "Offer",
                price: property.price,
                priceCurrency: "ARS",
                availability: "https://schema.org/InStock",
                businessFunction:
                    String(property.operationType || "").toLowerCase() === "alquiler"
                        ? "http://purl.org/goodrelations/v1#LeaseOut"
                        : "http://purl.org/goodrelations/v1#Sell"
            };
        }

        if (
            window.PropertyMap &&
            window.PropertyMap.hasValidCoordinates(property.latitude, property.longitude)
        ) {
            schema.geo = {
                "@type": "GeoCoordinates",
                latitude: property.latitude,
                longitude: property.longitude
            };
        }

        return schema;
    }

    function updatePageSEO(options) {
        const config = getConfig();
        const title = options.title || config.siteName;
        const description = options.description || "";
        const canonical = options.canonical || getSiteUrl();
        const image = toAbsoluteUrl(options.image || config.defaultImage);
        const ogType = options.ogType || "website";

        document.title = title;
        setMetaByName("description", description);
        setMetaByName("robots", options.robots || "index, follow");
        setCanonical(canonical);

        setMetaByProperty("og:title", title);
        setMetaByProperty("og:description", description);
        setMetaByProperty("og:type", ogType);
        setMetaByProperty("og:url", canonical);
        setMetaByProperty("og:image", image);
        setMetaByProperty("og:site_name", config.siteName);
        setMetaByProperty("og:locale", config.defaultLocale || "es_AR");

        setMetaByName("twitter:card", "summary_large_image");
        setMetaByName("twitter:title", title);
        setMetaByName("twitter:description", description);
        setMetaByName("twitter:image", image);
    }

    function applyPropertyPageSEO(property) {
        const title = `${property.title} | ${property.operationType} en San Juan`;
        const description = `${property.title} - ${property.type} en ${property.location}, San Juan, Argentina. ${property.operationType}. Precio: ${property.price}. Consultá con Grupo Flores.`;
        const canonical = `${getSiteUrl()}/details.html?id=${encodeURIComponent(property.id)}`;
        const image = property.image || getConfig().defaultImage;

        updatePageSEO({
            title,
            description: description.slice(0, 160),
            canonical,
            image,
            ogType: "article"
        });

        setJsonLd("jsonld-property", buildPropertyListingSchema(property));
    }

    window.SEOUtils = {
        escapeHtml,
        toAbsoluteUrl,
        getSiteUrl,
        setMetaByName,
        setMetaByProperty,
        setCanonical,
        setJsonLd,
        updatePageSEO,
        applyPropertyPageSEO,
        buildOrganizationSchema,
        buildWebsiteSchema,
        buildPropertyListingSchema
    };
})();
