(function () {
    const config = window.SEO_CONFIG;
    const utils = window.SEOUtils;
    if (!config || !utils) {
        return;
    }

    const pageKey = document.currentScript?.dataset?.page || "home";
    const page = config.pages?.[pageKey];
    if (!page) {
        return;
    }

    const canonicalPath = page.path ? `/${page.path}` : "/";
    const canonical = `${utils.getSiteUrl()}${canonicalPath === "/index.html" ? "/" : canonicalPath}`.replace(
        /\/index\.html$/,
        "/"
    );

    utils.updatePageSEO({
        title: page.title,
        description: page.description,
        canonical,
        ogType: page.ogType || "website"
    });

    utils.setJsonLd("jsonld-organization", utils.buildOrganizationSchema());
    utils.setJsonLd("jsonld-website", utils.buildWebsiteSchema());

    if (pageKey === "nosotros") {
        utils.setJsonLd("jsonld-about", {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: page.title,
            description: page.description,
            url: canonical,
            isPartOf: { "@id": `${utils.getSiteUrl()}/#website` },
            about: { "@id": `${utils.getSiteUrl()}/#organization` }
        });
    }

    if (pageKey === "propietarios") {
        utils.setJsonLd("jsonld-propietarios", {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: page.title,
            description: page.description,
            url: canonical,
            inLanguage: "es-AR",
            isPartOf: { "@id": `${utils.getSiteUrl()}/#website` },
            about: { "@id": `${utils.getSiteUrl()}/#organization` }
        });
    }
})();
