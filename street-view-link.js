/**
 * URLs de Google Street View desde coordenadas de propiedad.
 * Expone window.StreetViewLink { hasValidCoordinates, isMobileDevice, buildUrl }.
 */
(function () {
    function parseCoordinate(value) {
        const num = Number(value);
        return Number.isFinite(num) ? num : null;
    }

    function hasValidCoordinatesLocal(lat, lng) {
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

    function hasValidCoordinates(lat, lng) {
        if (window.PropertyMap && typeof window.PropertyMap.hasValidCoordinates === "function") {
            return window.PropertyMap.hasValidCoordinates(lat, lng);
        }

        const latNum = parseCoordinate(lat);
        const lngNum = parseCoordinate(lng);
        return hasValidCoordinatesLocal(latNum, lngNum);
    }

    function isMobileDevice() {
        const narrowViewport = window.matchMedia("(max-width: 768px)").matches;
        const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
        return narrowViewport && coarsePointer;
    }

    function buildUrl(lat, lng) {
        const latNum = parseCoordinate(lat);
        const lngNum = parseCoordinate(lng);

        if (!hasValidCoordinates(latNum, lngNum)) {
            return null;
        }

        const viewpoint = `${latNum},${lngNum}`;

        if (isMobileDevice()) {
            return `https://maps.google.com/?layer=c&cbll=${viewpoint}`;
        }

        return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${viewpoint}`;
    }

    window.StreetViewLink = {
        hasValidCoordinates,
        isMobileDevice,
        buildUrl
    };
})();
