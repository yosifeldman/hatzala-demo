mapboxgl.accessToken = 'pk.eyJ1IjoieW9zaWZlbGRtYW4iLCJhIjoiY2p0MndpOThuMGgwYzQzbHNwdjFmMGVsdyJ9.KhNhxIjHU_GCRY9ORjO7BQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-122.486052, 37.830348],
    zoom: 15
});

let myPath = [[-122.48695850372314, 37.82931081282506]];

let allPoints = [
    [-122.48369693756104, 37.83381888486939],
    [-122.48348236083984, 37.83317489144141],
    [-122.48339653015138, 37.83270036637107],
    [-122.48356819152832, 37.832056363179625],
    [-122.48404026031496, 37.83114119107971],
    [-122.48404026031496, 37.83049717427869],
    [-122.48348236083984, 37.829920943955045],
    [-122.48356819152832, 37.82954808664175],
    [-122.48507022857666, 37.82944639795659],
    [-122.48610019683838, 37.82880236636284],
    [-122.48695850372314, 37.82931081282506],
    [-122.48700141906738, 37.83080223556934],
    [-122.48751640319824, 37.83168351665737],
    [-122.48803138732912, 37.832158048267786],
    [-122.48888969421387, 37.83297152392784],
    [-122.48987674713133, 37.83263257682617],
    [-122.49043464660643, 37.832937629287755],
    [-122.49125003814696, 37.832429207817725],
    [-122.49163627624512, 37.832564787218985],
    [-122.49223709106445, 37.83337825839438],
    [-122.49378204345702, 37.83368330777276]
];

let marker = new mapboxgl.Marker({
    draggable: true
})
    .setLngLat(myPath[0])
    .addTo(map);

function markPath() {
    let lngLat = marker.getLngLat();
    myPath.push([lngLat.lng, lngLat.lat]);
    map.getSource("route").setData({
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "LineString",
            "coordinates": myPath
        }
    });
}

function onDragEnd() {
    markPath();
}

function onDragStart() {
}

marker.on('dragend', onDragEnd);
marker.on('dragstart', onDragStart);

map.on('load', () => {

    map.addLayer({
        'id': 'maine',
        'type': 'fill',
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [
                        allPoints
                    ]
                }
            }
        },
        'layout': {},
        'paint': {
            'fill-color': '#f00',
            'fill-opacity': 0.5
        }
    });

    map.addLayer({
        "id": "route",
        "type": "line",
        "source": {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": myPath
                }
            }
        },
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#555",
            "line-width": 8
        }
    });
});

function sendForm(ev) {
    let sel = document.getElementById("type"), t = sel.options[sel.selectedIndex].text,
        v = Number(sel.options[sel.selectedIndex].value), c = document.getElementById("custom"),
        sss = document.getElementById('log_messages'), d = new Date();
    let h = '<li class=\'msg\'>\n' +
        '                <span class=\'name\'>My name</span><span class=\'date\'>' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '</span><br>\n' +
        '                <p>' + (v !== 5 ? t : c.value) + '</p>\n' +
        '            </li>';
    sss.innerHTML = h + sss.innerHTML;
    ev.stopPropagation();
    return false;
}

function onSelect(e) {
    let sel = Number(e.options[e.selectedIndex].value), s = document.getElementById("custom_input");
    if (sel === 5) {
        s.className = "";
    } else {
        s.className = "hide";
    }
}

function noSubmit(ev) {
    ev.stopPropagation();
    return false;
}

map.addControl(new MapboxDirections({
    accessToken: mapboxgl.accessToken
}), 'top-left');