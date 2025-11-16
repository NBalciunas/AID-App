export const chooseMap = (maps, setTargetData, name) => {
    const locs = maps[name];
    if (!locs || locs.length === 0) return;

    const first = locs[0];

    setTargetData({
        location_name: `${name} – ${first.id}`,
        location: { ...first }
    });
};
