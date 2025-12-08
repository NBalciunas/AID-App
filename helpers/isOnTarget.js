const isOnTarget = (distanceMeters, accuracy, baseThreshold = 15) => {
    if(distanceMeters == null){
        return false;
    }

    const dynamicRadius = Math.max(baseThreshold, accuracy || 0); // meters

    return distanceMeters <= dynamicRadius;
}

export default isOnTarget;
