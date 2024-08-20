// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place, time, depth, and magnitude of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
        <p>${new Date(feature.properties.time)}</p>
        <p>Depth: ${feature.geometry.coordinates[2]}</p>
        <p>Magnitude: ${feature.properties.mag}</p>`);
  }
  
  // Define a function to determine the color based on depth, greater depth darker color
  function getColor(depth) {
    return depth > 90 ? "#fc0303" : //red 
           depth > 70 ? "#fc8403" : //dark orange
           depth > 50 ? "#fca503" : //lighter orange 
           depth > 30 ? "#fcc603" : //even lighter orange 
           depth > 10 ? "#c3ff00" : // light green
                        "#40ff00"; // green 
  }

  // Define a function to set the radius of the circle based on 
  // Define a function to set the radius of the circle markers based on magnitude.
  function getRadius(magnitude) {
    return magnitude * 4; // Adjust the multiplier as needed
  }
    
  // Define a function to create circle markers instead of default markers.
  function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: getRadius(feature.properties.mag), // Adjust the size of the circle
      fillColor: getColor(feature.geometry.coordinates[2]), // Circle color
      color: "#000", // Border color
      weight: 1, // Border thickness
      opacity: 1, // Border opacity
      fillOpacity: 0.5 // Fill opacity
    });
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // let sat = L.tileLayer("http://www.google.cn/maps/vt?lyrs=s@1...{x}&y={y}&z={z}.png", {
  //   attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
  // });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });


  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
    // "Satellite": sat
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add Legend to the Map 
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let depths = [-10, 10, 30, 50, 70, 90];
    let labels = [];

    // loop through depths internal and generate a label with colored square 
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML += '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
    }
    return div;
  };

  legend.addTo(myMap);
}
