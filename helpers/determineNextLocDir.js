const determineNextLocDir = (heading, bearingToTarget, deadZone = 5) => {
    if(heading == null || bearingToTarget == null){
        return "A"; // Ahead
    }

    let diff = ((bearingToTarget - heading + 540) % 360) - 180;

    if(Math.abs(diff) <= deadZone){
        return "A"; // Ahead
    }
    return diff > 0 ? "R" : "L"; // Right Left
};

export default determineNextLocDir;
