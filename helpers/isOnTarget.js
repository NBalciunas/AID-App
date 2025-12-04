const isOnTarget = (distanceMeters, accuracy, baseThreshold = 5) => {
    if(distanceMeters == null){
        return false;
    }

    const dynamicRadius = Math.max(baseThreshold, accuracy || 0); // meters

    return distanceMeters <= dynamicRadius;
}

export default isOnTarget;
