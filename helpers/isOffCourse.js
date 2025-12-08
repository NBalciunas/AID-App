const toRad = (x) => (x * Math.PI) / 180;

const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const bearingDeg = (lat1, lon1, lat2, lon2) => {
    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
};

const angleDiff = (a, b) => {
    let d = ((a - b + 540) % 360) - 180;
    return Math.abs(d);
};

const isOffCourse = (nodes, expectedId, coords, headingDeg, thresholdMeters = 20) => {
    if(!nodes?.length || !coords || expectedId == null){
        return { offCourse: false, snappedNode: null };
    }

    const expected = nodes.find((n) => n.id === expectedId);
    if(!expected){
        return { offCourse: false, snappedNode: null };
    }

    const { latitude, longitude } = coords;
    const distToExpected = haversine(
        latitude,
        longitude,
        expected.lat,
        expected.lon
    );

    let bestNode = null;
    let bestDist = Infinity;

    for(const n of nodes){
        const d = haversine(latitude, longitude, n.lat, n.lon);

        if(headingDeg != null){
            const brng = bearingDeg(latitude, longitude, n.lat, n.lon);
            const diff = angleDiff(brng, headingDeg);
            if(diff > 90){
                continue;
            }
        }

        if(d < bestDist){
            bestDist = d;
            bestNode = n;
        }
    }

    if(!bestNode){
        return { offCourse: false, snappedNode: null };
    }

    if(bestNode.id !== expectedId && bestDist < distToExpected && bestDist < thresholdMeters){
        return { offCourse: true, snappedNode: bestNode };
    }

    return { offCourse: false, snappedNode: expected };
};

export default isOffCourse;
