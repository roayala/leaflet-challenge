// URL from APi
var urlMonth = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
var urlWeek = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";
var urlDay = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson";
var ulrHour = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson";

console.log("hola");
d3.json(urlMonth, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
    // console.log(data.features);
});



function getColor(d) {
    return d > 5 ? '#BD0026' :
        d > 4 ? '#E31A1C' :
        d > 3 ? '#FC4E2A' :
        d > 2 ? '#FD8D3C' :
        d > 1 ? '#FEB24C' :
        d > 0 ? '#FED976' :
        '#FFEDA0';
}

function createFeatures(features) {
    // console.log(features.properties);

    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.title +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    function style(feature) {
        return {
            fillColor: getColor(feature.properties.mag),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    function pointToLayer(feature, latlng) {
        // console.log(latlng);
        // console.log(feature.properties.mag);
        mag = (feature.properties.mag);
        // console.log(radius);

        if (mag > 5) {
            radius = 200000;
        } else if (mag > 4) {
            radius = 100000;
        } else if (mag > 3) {
            radius = 50000;
        } else if (mag > 2) {
            radius = 30000;
        } else if (mag > 1) {
            radius = 18000;
        } else if (mag >= 0) {
            radius = 10000;
        } else if (mag < 0) {
            radius = 500;
        }
        return L.circle(latlng, {
            fillColor: getColor(feature.properties.mag),
            fillOpacity: 0.4,
            radius: radius
        });
    }

    var earthquakes = L.geoJSON(features, { pointToLayer: pointToLayer, onEachFeature: onEachFeature, style: style });

    createMap(earthquakes);
};



function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes monthly": earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            33.489227, -112.115820
        ],
        zoom: 6,
        layers: [streetmap, earthquakes]
    });

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(myMap) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, ],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    legend.addTo(myMap);

}