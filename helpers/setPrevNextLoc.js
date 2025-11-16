export const hasPrev = (allLocations, currentLoc) => {
    const index = allLocations.findIndex(l => l.id === currentLoc?.id);
    return(index > 0);
};

export const hasNext = (allLocations, currentLoc) => {
    const index = allLocations.findIndex(l => l.id === currentLoc?.id);
    return(index >= 0 && index < allLocations.length - 1);
};

export const setPrevLoc = (type, allLocations, currentLoc, setTargetData) => {
    const index = allLocations.findIndex(l => l.id === currentLoc?.id);
    if(index <= 0){
        return;
    }

    const prev = allLocations[index - 1];

    setTargetData({
        location_name: `${type} – ${prev.id}`,
        location: { ...prev }
    });
};

export const setNextLoc = (type, allLocations, currentLoc, setTargetData) => {
    const index = allLocations.findIndex(l => l.id === currentLoc?.id);
    if(index < 0 || index >= allLocations.length - 1){
        return;
    }

    const next = allLocations[index + 1];

    setTargetData({
        location_name: `${type} – ${next.id}`,
        location: { ...next }
    });
};
