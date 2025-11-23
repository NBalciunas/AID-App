const setTarget = (maps, type, locationId, setTargetData) => {
    if(!maps || !maps[type]){
        return;
    }
    const allLocations = maps[type];
    let loc = null;

    if(locationId != null){
        loc = allLocations.find(l => String(l.id) === String(locationId));
    }

    if(!loc){
        loc = allLocations[0];
    }

    setTargetData({
        location_name: `${type} – ${loc.id}`,
        location: { ...loc }
    });
};

export default setTarget;