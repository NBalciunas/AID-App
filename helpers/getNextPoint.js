const distanceSq = (lat1, lon1, lat2, lon2) => {
    const dLat = lat1 - lat2;
    const dLon = lon1 - lon2;
    return dLat * dLat + dLon * dLon;
};

const getNextPoint = (nodes, currentId, prevId = null) => {
    if(!nodes?.length || currentId == null){
        return null;
    }

    const nodeById = new Map(nodes.map(n => [n.id, n]));

    const current = nodeById.get(currentId);
    const last = nodes[nodes.length - 1];
    if(!current || !last){
        return null;
    }

    if(current.id === last.id){
        return null;
    }

    let neighbors = (current.connected_to || []).map(id => nodeById.get(id)).filter(Boolean);

    const withoutPrev = neighbors.filter(n => n.id !== prevId);
    if(withoutPrev.length){
        neighbors = withoutPrev;
    }

    let bestNeighborId = null;
    let bestDist = Infinity;

    for(const neighbor of neighbors){
        const d = distanceSq(neighbor.lat, neighbor.lon, last.lat, last.lon);

        if(d < bestDist){
            bestDist = d;
            bestNeighborId = neighbor.id;
        }
    }

    return bestNeighborId;
};

export default getNextPoint;
