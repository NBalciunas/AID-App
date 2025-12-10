import json
import math
import os
from typing import List, Tuple
from collections import deque

import requests
from dotenv import load_dotenv

# =============== ENV / CONFIG ===============

# Load .env from current folder (expects ORS_API_KEY there)
load_dotenv()
ORS_API_KEY = os.getenv("ORS_API_KEY", "").strip()
if not ORS_API_KEY:
    raise RuntimeError("ORS_API_KEY not found in .env")

# Start and end coordinates (example: barracks -> shop)
START_LAT, START_LON = 52.50479, 6.11230
END_LAT,   END_LON   = 52.50640, 6.10199

# Number of extra alternative routes besides the main one (ORS limit: max 2)
ALT_ROUTE_COUNT = 0   # 0, 1, or 2

# How many ladder connectors per alt route along the main route
CONNECTORS_PER_ALT = 3

# Max distance (m) to connect main <-> alt routes
MAX_CONNECTOR_DIST_M = 400.0

# Simplification thresholds for ORS polylines
ANGLE_THRESHOLD_DEG = 15.0   # keep points where turn angle ≥ this
MAX_SEGMENT_DIST_M  = 60.0   # also keep points at least every X m on straights

# Graph cleaning parameters
MERGE_DIST_M             = 4.0     # merge nodes closer than this
CONNECT_DIST_M           = 25.0    # auto-connect nodes closer than this
COMPONENT_LINK_MAX_DIST  = 35.0    # bridge components if closest nodes < this
NEAR_LINE_DIST_M         = 8.0     # if node is this close to a segment, snap-split it
SKIP_MAX_EXTRA_RATIO     = 0.15    # path can be up to 15% longer than direct edge
SKIP_MAX_PERP_DIST_M     = 5.0     # path must stay within 5 m of straight line

# Output file paths
JSON_PATH = "route.json"
KML_PATH  = "route.kml"


# =============== GEOMETRY HELPERS ===============

def haversine_m(lat1, lon1, lat2, lon2) -> float:
    R = 6371000.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def simplify_route(
    coords: List[Tuple[float, float]],
    angle_threshold_deg: float,
    max_segment_dist_m: float,
) -> List[Tuple[float, float]]:
    if len(coords) <= 2:
        return coords[:]

    simplified = [coords[0]]
    last_kept = coords[0]

    for i in range(1, len(coords) - 1):
        lon_prev, lat_prev = coords[i - 1]
        lon_curr, lat_curr = coords[i]
        lon_next, lat_next = coords[i + 1]

        dx1 = lon_curr - lon_prev
        dy1 = lat_curr - lat_prev
        dx2 = lon_next - lon_curr
        dy2 = lat_next - lat_curr

        mag1 = math.hypot(dx1, dy1)
        mag2 = math.hypot(dx2, dy2)
        angle = 0.0
        if mag1 != 0 and mag2 != 0:
            dot = dx1 * dx2 + dy1 * dy2
            cos_theta = dot / (mag1 * mag2)
            cos_theta = max(-1.0, min(1.0, cos_theta))
            angle = math.degrees(math.acos(cos_theta))

        lon_last, lat_last = last_kept
        dist = haversine_m(lat_last, lon_last, lat_curr, lon_curr)

        if angle >= angle_threshold_deg or dist >= max_segment_dist_m:
            simplified.append((lon_curr, lat_curr))
            last_kept = (lon_curr, lat_curr)

    simplified.append(coords[-1])
    return simplified


# =============== ORS HELPERS ===============

def ors_route(start_lon, start_lat, end_lon, end_lat, alt_count=0):
    alt_count = max(0, min(int(alt_count), 2))

    body = {
        "coordinates": [[start_lon, start_lat], [end_lon, end_lat]],
    }

    if alt_count > 0:
        body["alternative_routes"] = {
            "target_count": 1 + alt_count,
            "share_factor": 0.6,
            "weight_factor": 2.0,
        }

    resp = requests.post(
        "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
        headers={
            "Authorization": ORS_API_KEY,
            "Content-Type": "application/json",
        },
        json=body,
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"ORS error {resp.status_code}: {resp.text}")

    data = resp.json()
    features = data.get("features", [])
    routes = []
    for feat in features:
        coords = feat.get("geometry", {}).get("coordinates", [])
        if not coords:
            continue
        if len(coords) > 1200:
            step = math.ceil(len(coords) / 1200)
            coords = coords[::step]
        routes.append(coords)

    return routes


def find_closest_index(route, lon, lat):
    best_idx = 0
    best_dist = float("inf")
    for i, (lon2, lat2) in enumerate(route):
        d = haversine_m(lat, lon, lat2, lon2)
        if d < best_dist:
            best_dist = d
            best_idx = i
    return best_idx, best_dist


# =============== GRAPH FROM ROUTES ===============

def build_graph_from_routes(
    routes: List[List[Tuple[float, float]]],
    precision: int = 6,
):
    node_map = {}
    nodes_arr = []
    edges = set()

    def get_node_id(lon, lat):
        key = (round(lat, precision), round(lon, precision))
        if key not in node_map:
            node_id = len(nodes_arr) + 1
            node_map[key] = node_id
            nodes_arr.append({
                "id": node_id,
                "lat": key[0],
                "lon": key[1],
                "connected_to": [],
            })
        else:
            node_id = node_map[key]
        return node_id

    for route in routes:
        prev_id = None
        for lon, lat in route:
            nid = get_node_id(lon, lat)
            if prev_id is not None and prev_id != nid:
                a, b = sorted((prev_id, nid))
                edges.add((a, b))
            prev_id = nid

    for a, b in edges:
        na = nodes_arr[a - 1]["connected_to"]
        nb = nodes_arr[b - 1]["connected_to"]
        if b not in na:
            na.append(b)
        if a not in nb:
            nb.append(a)

    for n in nodes_arr:
        n["connected_to"].sort()

    return nodes_arr


# =============== CLEANER HELPERS ===============

def json_to_internal(json_nodes):
    coords = []
    neighbors = []
    n = len(json_nodes)
    for node in json_nodes:
        coords.append((float(node["lat"]), float(node["lon"])))
        neighbors.append(set())

    for i, node in enumerate(json_nodes):
        for neigh_id in node.get("connected_to", []):
            j = neigh_id - 1
            if j < 0 or j >= n or j == i:
                continue
            neighbors[i].add(j)
            neighbors[j].add(i)

    return coords, neighbors


def merge_close_nodes(coords, neighbors, merge_dist_m):
    n = len(coords)
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return
        if ra < rb:
            parent[rb] = ra
        else:
            parent[ra] = rb

    for i in range(n):
        lat1, lon1 = coords[i]
        for j in range(i + 1, n):
            lat2, lon2 = coords[j]
            d = haversine_m(lat1, lon1, lat2, lon2)
            if d <= merge_dist_m:
                union(i, j)

    groups = {}
    for i in range(n):
        r = find(i)
        groups.setdefault(r, []).append(i)

    new_idx_map = {}
    new_coords = []

    for new_idx, (root, members) in enumerate(groups.items()):
        if len(members) == 1:
            lat, lon = coords[members[0]]
        else:
            lat = sum(coords[k][0] for k in members) / len(members)
            lon = sum(coords[k][1] for k in members) / len(members)
        new_coords.append((lat, lon))
        for old in members:
            new_idx_map[old] = new_idx

    new_neighbors = [set() for _ in range(len(new_coords))]
    for u in range(n):
        for v in neighbors[u]:
            nu = new_idx_map[u]
            nv = new_idx_map[v]
            if nu == nv:
                continue
            new_neighbors[nu].add(nv)
            new_neighbors[nv].add(nu)

    return new_coords, new_neighbors


def connect_close_nodes(coords, neighbors, connect_dist_m):
    n = len(coords)
    for i in range(n):
        lat1, lon1 = coords[i]
        for j in range(i + 1, n):
            lat2, lon2 = coords[j]
            d = haversine_m(lat1, lon1, lat2, lon2)
            if d <= connect_dist_m:
                neighbors[i].add(j)
                neighbors[j].add(i)
    return neighbors


def connect_components(coords, neighbors, max_dist_m):
    n = len(coords)
    comp = [-1] * n
    comp_id = 0

    for i in range(n):
        if comp[i] != -1:
            continue
        stack = [i]
        comp[i] = comp_id
        while stack:
            u = stack.pop()
            for v in neighbors[u]:
                if comp[v] == -1:
                    comp[v] = comp_id
                    stack.append(v)
        comp_id += 1

    if comp_id <= 1:
        return neighbors

    nodes_in_comp = [[] for _ in range(comp_id)]
    for i, cid in enumerate(comp):
        nodes_in_comp[cid].append(i)

    for c1 in range(comp_id):
        for c2 in range(c1 + 1, comp_id):
            best_d = float("inf")
            best_pair = None
            for i in nodes_in_comp[c1]:
                lat1, lon1 = coords[i]
                for j in nodes_in_comp[c2]:
                    lat2, lon2 = coords[j]
                    d = haversine_m(lat1, lon1, lat2, lon2)
                    if d < best_d:
                        best_d = d
                        best_pair = (i, j)
            if best_pair and best_d <= max_dist_m:
                a, b = best_pair
                neighbors[a].add(b)
                neighbors[b].add(a)

    return neighbors


def split_edges_by_near_nodes(coords, neighbors, near_line_dist_m):
    n = len(coords)
    edges = []
    for u in range(n):
        for v in neighbors[u]:
            if u < v:
                edges.append((u, v))

    for (u, v) in edges:
        lat_u, lon_u = coords[u]
        lat_v, lon_v = coords[v]

        lat0 = lat_u
        m_per_deg_lat = 111320.0
        m_per_deg_lon = 111320.0 * math.cos(math.radians(lat0))

        def ll_to_xy(lat, lon):
            x = (lon - lon_u) * m_per_deg_lon
            y = (lat - lat_u) * m_per_deg_lat
            return x, y

        xA, yA = ll_to_xy(lat_u, lon_u)
        xB, yB = ll_to_xy(lat_v, lon_v)
        dxAB = xB - xA
        dyAB = yB - yA
        lenAB2 = dxAB * dxAB + dyAB * dyAB
        if lenAB2 == 0:
            continue

        for w in range(n):
            if w == u or w == v:
                continue
            lat_w, lon_w = coords[w]
            xC, yC = ll_to_xy(lat_w, lon_w)

            t = ((xC - xA) * dxAB + (yC - yA) * dyAB) / lenAB2
            if t < 0.0 or t > 1.0:
                continue

            xD = xA + t * dxAB
            yD = yA + t * dyAB
            d_perp = math.hypot(xC - xD, yC - yD)

            if d_perp <= near_line_dist_m:
                neighbors[u].add(w)
                neighbors[w].add(u)
                neighbors[v].add(w)
                neighbors[w].add(v)

    return neighbors


def shortest_path_bfs(neighbors, start, end):
    q = deque([start])
    prev = {start: None}
    while q:
        u = q.popleft()
        if u == end:
            break
        for v in neighbors[u]:
            if v not in prev:
                prev[v] = u
                q.append(v)
    if end not in prev:
        return None
    path = []
    cur = end
    while cur is not None:
        path.append(cur)
        cur = prev[cur]
    path.reverse()
    return path


def prune_skip_edges(coords, neighbors, max_extra_ratio, max_perp_dist_m):
    n = len(coords)
    edges = []
    for u in range(n):
        for v in neighbors[u]:
            if u < v:
                edges.append((u, v))

    for (u, v) in edges:
        if v not in neighbors[u]:
            continue
        lat_u, lon_u = coords[u]
        lat_v, lon_v = coords[v]
        direct_len = haversine_m(lat_u, lon_u, lat_v, lon_v)

        neighbors[u].remove(v)
        neighbors[v].remove(u)

        path = shortest_path_bfs(neighbors, u, v)
        if path is None:
            neighbors[u].add(v)
            neighbors[v].add(u)
            continue

        path_len = 0.0
        for i in range(len(path) - 1):
            a, b = path[i], path[i + 1]
            lat_a, lon_a = coords[a]
            lat_b, lon_b = coords[b]
            path_len += haversine_m(lat_a, lon_a, lat_b, lon_b)

        if path_len > direct_len * (1 + max_extra_ratio):
            neighbors[u].add(v)
            neighbors[v].add(u)
            continue

        lat0 = lat_u
        m_per_deg_lat = 111320.0
        m_per_deg_lon = 111320.0 * math.cos(math.radians(lat0))

        def ll_to_xy(lat, lon):
            x = (lon - lon_u) * m_per_deg_lon
            y = (lat - lat_u) * m_per_deg_lat
            return x, y

        xA, yA = ll_to_xy(lat_u, lon_u)
        xB, yB = ll_to_xy(lat_v, lon_v)
        dxAB = xB - xA
        dyAB = yB - yA
        lenAB = math.hypot(dxAB, dyAB)
        if lenAB == 0:
            neighbors[u].add(v)
            neighbors[v].add(u)
            continue

        ok_collinear = True
        for w in path[1:-1]:
            lat_w, lon_w = coords[w]
            xC, yC = ll_to_xy(lat_w, lon_w)

            t = ((xC - xA) * dxAB + (yC - yA) * dyAB) / (lenAB ** 2)
            t = max(0.0, min(1.0, t))
            xD = xA + t * dxAB
            yD = yA + t * dyAB
            d_perp = math.hypot(xC - xD, yC - yD)

            if d_perp > max_perp_dist_m:
                ok_collinear = False
                break

        if not ok_collinear:
            neighbors[u].add(v)
            neighbors[v].add(u)

    return neighbors


def internal_to_json(coords, neighbors):
    N = len(coords)

    def closest_index(target_lat, target_lon):
        best = None
        best_d = float("inf")
        for i, (lat, lon) in enumerate(coords):
            d = haversine_m(target_lat, target_lon, lat, lon)
            if d < best_d:
                best_d = d
                best = i
        return best

    start_idx = closest_index(START_LAT, START_LON)
    dest_idx = closest_index(END_LAT, END_LON)

    all_idx = list(range(N))
    middle = [i for i in all_idx if i not in {start_idx, dest_idx}]
    middle.sort()

    ordered = []
    if start_idx is not None:
        ordered.append(start_idx)
    ordered.extend(middle)
    if dest_idx is not None and dest_idx not in ordered:
        ordered.append(dest_idx)

    mapping = {old: i + 1 for i, old in enumerate(ordered)}

    nodes_out = [None] * len(mapping)
    conn_sets = {new_id: set() for new_id in mapping.values()}

    for old in all_idx:
        new_id = mapping[old]
        lat, lon = coords[old]
        nodes_out[new_id - 1] = {
            "id": new_id,
            "lat": lat,
            "lon": lon,
            "connected_to": [],
        }

    for old_u in all_idx:
        new_u = mapping[old_u]
        for old_v in neighbors[old_u]:
            new_v = mapping[old_v]
            if new_v == new_u:
                continue
            conn_sets[new_u].add(new_v)

    for new_id, nbrs in conn_sets.items():
        nodes_out[new_id - 1]["connected_to"] = sorted(nbrs)

    return nodes_out


def clean_graph(json_nodes):
    coords, neighbors = json_to_internal(json_nodes)
    coords, neighbors = merge_close_nodes(coords, neighbors, MERGE_DIST_M)
    neighbors = connect_close_nodes(coords, neighbors, CONNECT_DIST_M)
    neighbors = connect_components(coords, neighbors, COMPONENT_LINK_MAX_DIST)
    neighbors = split_edges_by_near_nodes(coords, neighbors, NEAR_LINE_DIST_M)
    neighbors = prune_skip_edges(
        coords,
        neighbors,
        SKIP_MAX_EXTRA_RATIO,
        SKIP_MAX_PERP_DIST_M,
    )
    json_clean = internal_to_json(coords, neighbors)
    return json_clean


# =============== KML FROM CLEANED JSON ===============

def build_kml_from_json(json_nodes):
    node_placemarks = []
    for node in json_nodes:
        nid = node["id"]
        lat = node["lat"]
        lon = node["lon"]
        node_placemarks.append(f"""
      <Placemark>
        <name>{nid}</name>
        <Point>
          <coordinates>{lon},{lat},0</coordinates>
        </Point>
      </Placemark>""")

    edge_seen = set()
    edge_placemarks = []
    for node in json_nodes:
        u = node["id"]
        lat_u = node["lat"]
        lon_u = node["lon"]
        for v in node.get("connected_to", []):
            if u == v:
                continue
            a, b = sorted((u, v))
            if (a, b) in edge_seen:
                continue
            edge_seen.add((a, b))
            node_v = json_nodes[b - 1]
            lat_v = node_v["lat"]
            lon_v = node_v["lon"]
            edge_placemarks.append(f"""
      <Placemark>
        <Style>
          <LineStyle>
            <color>ff0000ff</color>
            <width>3</width>
          </LineStyle>
        </Style>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>
            {lon_u},{lat_u},0
            {lon_v},{lat_v},0
          </coordinates>
        </LineString>
      </Placemark>""")

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Cleaned Route Graph</name>

    <Folder>
      <name>Nodes</name>
      {''.join(node_placemarks)}
    </Folder>

    <Folder>
      <name>Edges</name>
      {''.join(edge_placemarks)}
    </Folder>
  </Document>
</kml>"""


# =============== MAIN LOGIC ===============

def main():
    print("Requesting main + alternative routes from ORS...")
    base_routes_raw = ors_route(
        START_LON,
        START_LAT,
        END_LON,
        END_LAT,
        alt_count=ALT_ROUTE_COUNT,
    )

    if not base_routes_raw:
        print("No routes returned from ORS.")
        return

    print(f"Base routes received: {len(base_routes_raw)}")

    base_routes = []
    for i, coords in enumerate(base_routes_raw, start=1):
        simp = simplify_route(
            coords,
            ANGLE_THRESHOLD_DEG,
            MAX_SEGMENT_DIST_M,
        )
        if simp:
            simp[0] = (START_LON, START_LAT)
            simp[-1] = (END_LON, END_LAT)
        base_routes.append(simp)
        print(f"  Base route {i}: {len(coords)} pts -> {len(simp)} pts")

    ladder_routes = []
    if len(base_routes) > 1 and CONNECTORS_PER_ALT > 0:
        main_route = base_routes[0]
        last_idx = len(main_route) - 1

        base_indices = []
        for k in range(1, CONNECTORS_PER_ALT + 1):
            idx = round(k * last_idx / (CONNECTORS_PER_ALT + 1))
            if 0 < idx < last_idx:
                base_indices.append(idx)

        print(f"Connector base indices on main route: {base_indices}")

        for alt_idx in range(1, len(base_routes)):
            alt_route = base_routes[alt_idx]
            print(f"Building connectors to alt route {alt_idx + 1}...")

            for mi in base_indices:
                m_lon, m_lat = main_route[mi]
                ai, dist_m = find_closest_index(alt_route, m_lon, m_lat)
                if dist_m > MAX_CONNECTOR_DIST_M:
                    continue

                a_lon, a_lat = alt_route[ai]

                try:
                    conn_raw = ors_route(m_lon, m_lat, a_lon, a_lat, alt_count=0)
                except RuntimeError as e:
                    print("   connector ORS error:", e)
                    continue

                if not conn_raw:
                    continue

                conn_coords = conn_raw[0]
                simp_conn = simplify_route(
                    conn_coords,
                    ANGLE_THRESHOLD_DEG,
                    MAX_SEGMENT_DIST_M,
                )

                if len(simp_conn) > 1:
                    simp_conn[0] = (m_lon, m_lat)
                    simp_conn[-1] = (a_lon, a_lat)
                    ladder_routes.append(simp_conn)
                    print(
                        f"   connector main[{mi}] -> alt[{ai}] "
                        f"({dist_m:.0f} m): {len(conn_coords)} -> {len(simp_conn)} pts"
                    )

    print(f"Ladder routes created: {len(ladder_routes)}")

    all_routes = base_routes + ladder_routes

    print("Building merged JSON graph (raw)...")
    json_nodes_raw = build_graph_from_routes(all_routes)
    print(f"  Raw graph nodes: {len(json_nodes_raw)}")

    print("Cleaning graph (merge/Connect/bridge/split/prune)...")
    json_nodes_clean = clean_graph(json_nodes_raw)
    print(f"  Clean graph nodes: {len(json_nodes_clean)}")

    print(f"Writing {JSON_PATH} ...")
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(json_nodes_clean, f, indent=2)

    print(f"Writing {KML_PATH} ...")
    kml_str = build_kml_from_json(json_nodes_clean)
    with open(KML_PATH, "w", encoding="utf-8") as f:
        f.write(kml_str)

    print("Done.")


if __name__ == "__main__":
    main()
