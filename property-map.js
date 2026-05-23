/**
 * Mini mapa Leaflet para el detalle de propiedad.
 * Expone window.PropertyMap { init, destroy }.
 */
(function () {
    let mapInstance = null;
    let markerInstance = null;

    function parseCoordinate(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    }

    function hasValidCoordinates(lat, lng) {
        return (
            lat !== null &&
            lng !== null &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180 &&
            !(lat === 0 && lng === 0)
        );
    }

    function destroyPropertyMap() {
        if (mapInstance) {
            mapInstance.off();
            mapInstance.remove();
            mapInstance = null;
            markerInstance = null;
        }
    }

    function initPropertyMap(containerId, lat, lng, options = {}) {
        if (typeof L === "undefined") {
            console.warn("Leaflet no esta cargado.");
            return null;
        }

        destroyPropertyMap();

        const latNum = parseCoordinate(lat);
        const lngNum = parseCoordinate(lng);

        if (!hasValidCoordinates(latNum, lngNum)) {
            return null;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            return null;
        }

        const zoom = options.zoom ?? 15;

        mapInstance = L.map(container, {
            scrollWheelZoom: false,
            attributionControl: true
        }).setView([latNum, lngNum], zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapInstance);

        markerInstance = L.marker([latNum, lngNum]).addTo(mapInstance);

        if (options.popupText) {
            markerInstance.bindPopup(options.popupText);
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (mapInstance) {
                    mapInstance.invalidateSize();
                }
            });
        });

        return mapInstance;
    }

    window.PropertyMap = {
        init: initPropertyMap,
        destroy: destroyPropertyMap,
        hasValidCoordinates
    };
})();
