let stores;
let teams = [
    {id: 1, name: 'team 1'},
    {id: 2, name: 'team 2'},
    {id: 3, name: 'team 3'}
];
let markers = [], myGeo = {}, drone;

// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}


mapboxgl.accessToken = 'pk.eyJ1IjoicXVpY2tseS1kZXZlbG9wZXIiLCJhIjoiY2pzdmd6Z25oMDZkODRhcHZjZHhseGQ4NSJ9.yvtrH8EfSCrFWfRDrTy3EQ';
// This adds the map to your page
let map = new mapboxgl.Map({
    // container id specified in the HTML
    container: 'map',
    // style URL
    style: 'mapbox://styles/mapbox/streets-v9',
    // initial position in [lon, lat] format
    center: [-90.73414, 14.55524],
    // initial zoom
    zoom: 15
});

map.on('load', function () {
    getLocation();
    window.setInterval(function () {
       if(drone) {
           map.getSource('drone').setData(getRandomPointAround());
       }
    }, 2000);
});


map.addControl(new mapboxgl.FullscreenControl());
// Add geolocate control to the map.
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());


let draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        polygon: true,
        trash: true
    },
    styles: [
        {
            "id": "gl-draw-polygon-fill",
            "type": "fill",
            "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
            "paint": {
                "fill-color": "#D20C0C",
                "fill-outline-color": "#D20C0C",
                "fill-opacity": 0.6
            }
        }]
});


map.addControl(draw);


map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);

function updateArea(e) {

    let data = draw.getAll();


//let answer = document.getElementById('calculated-area');
    if (data.features.length > 0) {
//let area = turf.area(data);
        window.localStorage.setItem('user', JSON.stringify(data));

        stores = JSON.parse(window.localStorage.getItem('user'));
        buildLocationList(stores);
// restrict to area to 2 decimal points
//let rounded_area = Math.round(area*100)/100;
//answer.innerHTML = '<p><strong>' + rounded_area + '</strong></p><p>square meters</p>';
//} else {
//answer.innerHTML = '';
//if (e.type !== 'draw.delete') alert("Use the draw tools to draw a polygon!");
    }
}


function buildLocationList(data) {
    Clear();
    // Iterate through the list of stores
    let link;
    for (let i = 0; i < data.features.length; i++) {

        let currentFeature = data.features[i];
        // Shorten data.feature.properties to just `prop` so we're not
        // writing this long form over and over again.
        let prop = currentFeature.geometry;
        // Select the listing container in the HTML and append a div
        // with the class 'item' for each store
        let listings = document.getElementById('listings');
        let listing = listings.appendChild(document.createElement('ul'));
        listing.className = 'list-group';
        let listItem = listing.appendChild(document.createElement('Li'));

        listItem.className = 'list-group-item';
        listing.id = 'listing-' + i;
        let poly = turf.polygon(prop.coordinates);
        let area = turf.area(poly);
        //area /= 1000000
        //restrict to area to 2 decimal points
        let rounded_area = Math.round(area / 1000) * 1000;
        let areaUnits = " sq.km. ";
        rounded_area /= 1000000;
        if (rounded_area < 0.05) {
            rounded_area *= 1000000;
            areaUnits = " sq.m. ";
        }
        // Create a new link with the class 'title' for each store
        // and fill it with the store address
        link = listItem.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
        link.dataPosition = i;

        // link.innerHTML = '<p><strong>' + rounded_area +  areaUnits+' </strong></p>';
        let rad = Math.floor(Math.random() * 5);


        let detailsT = "<button type='button' class='btn btn-primary' data-toggle='collapse' data-target='#collapseExample' aria-expanded='false' aria-controls='collapseExample'>" +
            "Cell - " + (i + 1) + " <span class='badge badge-light'> " + rounded_area + areaUnits + " </span></button>"


        // Create a new div with the class 'details' for each store
        // and fill it with the city and phone number
        let details = listItem.appendChild(document.createElement('div'));
        details.innerHTML = detailsT;

        let option = listItem.appendChild(document.createElement('div'));
        //option.className = 'custom-select';
        let s = "<select class='custom-select' onchange='addUserMarker(this)'>" +
            "<option selected>Open this select menu</option>";
        for (let j = 0; j < teams.length; j++) {
            s += "<option value='team" + j + "-area" + i + "'>" + teams[j].name + "</option>";
        }
        s += "</select> ";
        option.innerHTML = s;
    }
    // Add an event listener for the links in the sidebar listing
    link.addEventListener('click', function (e) {
        // Update the currentFeature to the store associated with the clicked link
        let clickedListing = data.features[this.dataPosition];
        // 1. Fly to the point associated with the clicked link
        flyToStore(clickedListing);
        // 2. Close all other popups and display popup for clicked store
        createPopUp(clickedListing);
        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        let activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
            activeItem[0].classList.remove('active');
        }
        this.parentNode.classList.add('active');
    });
}


function Clear() {
    let myNode = document.getElementById("listings");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

function addUserMarker(sel) {
    let o = sel.options[sel.selectedIndex].value, a = o.split('-'), t = a[0][4], s = a[1][4];
    let point = stores.features[s].geometry.coordinates[0][0];
    markers[t] = new mapboxgl.Marker({
        draggable: true
    })
        .setLngLat(point)
        .addTo(map);
}


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    myGeo = position;// = "Latitude: " + position.coords.latitude +
    //"<br>Longitude: " + position.coords.longitude;
    addDrone();
}

function addDrone() {
    if (!drone) {
        map.addSource('drone', {
            type: 'geojson',
            data: {
                "geometry": {"type": "Point", "coordinates": [getRandomPointAround()]},
                "type": "Feature",
                "properties": {}
            }
        });
        drone = map.addLayer({
            "id": "drone",
            "type": "symbol",
            "source": "drone",
            "layout": {
                "icon-image": "rocket-15"
            }
        });
    }
}

function getRandomPointAround() {
    return {
        "geometry": {"type": "Point", "coordinates": [
            myGeo.coords.latitude+3.41, myGeo.coords.longitude-3.41]},
        "type": "Feature",
        "properties": {}
    };
}