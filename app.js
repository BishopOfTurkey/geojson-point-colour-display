mapboxgl.accessToken = 'pk.eyJ1IjoiYmlzaG9wb2Z0dXJrZXkiLCJhIjoiY2s0Y254dW5kMDg2NjNtdDYxZ3l6cHUxYSJ9.fQFZz6tWJFj0quCfrJT37g';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
});

//List geoJSON Files here seperated by commas.
// Make sure the files are in the /data directroy
const jsonFiles = [
    "test2.geojson",
    "test.geojson"
]

let geoJSONData = [];
let fileSelector = document.getElementById("file-selector");
let curSelectedMap = "";



function getAllJSONFiles() {
    jsonFiles.forEach((v, i) => {
        getJSON('data/'+v, (err, data) => {
            if (err !== null) {
                alert("Something went wrong:\n" + err);
            }
            let bounds = new mapboxgl.LngLatBounds();
            data.features.forEach(function (feature) {
                bounds.extend(feature.geometry.coordinates);
            });
            const layerINFO = {
                data: data,
                filename: v,
                bounds: bounds,
                index: i,
            }
            geoJSONData.push(layerINFO);
            addFilesToSelector(layerINFO);
            addGeoJSONtoMap(layerINFO);
            if (i == 0) {
                selectLayer(0)
            }
        });
    })
}

function addFilesToSelector(layerINFO) {
    var node = document.createElement("option");
    node.innerHTML = layerINFO.filename;
    fileSelector.appendChild(node);
}

function selectLayer(index) {
    let layerINFO = geoJSONData[index]
    map.fitBounds(layerINFO.bounds,{padding: 100});
    if (curSelectedMap !== "") {
        map.setLayoutProperty(curSelectedMap ,'visibility', 'none');
    }
    map.on("idle", () => {
        map.setLayoutProperty(layerINFO.filename ,'visibility', 'visible');
    });
}


map.on("load", function () {
    map.loadImage("icon.png", function (error0, image0) {
        if (error0) throw error0;
        map.addImage("marker", image0, {
            "sdf": "true"
        });
    });
    getAllJSONFiles();
});

function addGeoJSONtoMap(layerINFO) {
    map.addLayer({
        'id': layerINFO.filename,
        'type': 'symbol',
        'source': {
            'type': 'geojson',
            'data': layerINFO.data,
        },
        'layout': {
            'icon-image': 'marker',
            "icon-allow-overlap": true,
            "icon-size": 0.6,
            'visibility': 'none',
        },
        'paint': {
            'icon-color': ['get', 'marker-color']
        }
    })
}

//https://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript
function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};