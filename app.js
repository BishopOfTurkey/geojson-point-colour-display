mapboxgl.accessToken = 'pk.eyJ1IjoiYmlzaG9wb2Z0dXJrZXkiLCJhIjoiY2s0Y254dW5kMDg2NjNtdDYxZ3l6cHUxYSJ9.fQFZz6tWJFj0quCfrJT37g';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9'
});

let filesMap = new Map();


let fileList = document.getElementById("file-list");

var bounds = new mapboxgl.LngLatBounds();

document.getElementById("geoJSONFile").addEventListener("change", function () {
    if (this.files.length == 1) {
        document.getElementById("geoJSONFileText").innerHTML = this.files[0].name;
    } else {
        document.getElementById("geoJSONFileText").innerHTML = this.files.length + " files selected"
    }
});

document.getElementById("geoJSONFileSubmit").addEventListener("click", () => {
    const files = document.getElementById("geoJSONFile").files

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        var text;
        file.text().then((str) => {
            text = str;
            geoJSON = JSON.parse(text);


            geoJSON.id = file.name;
            addFile(file.name, geoJSON);
        })
    }
});

map.on("load", function () {
    map.loadImage("icon.png", function (error0, image0) {
        if (error0) throw error0;
        map.addImage("marker", image0, {
            "sdf": "true"
        });
    });
});

function addGeoJSONtoMap(geoJSON) {
    // console.log(geoJSON);
    geoJSON.features.forEach(function (feature) {
        bounds.extend(feature.geometry.coordinates);
    });
    map.addLayer({
        'id': geoJSON.id,
        'type': 'symbol',
        'source': {
            'type': 'geojson',
            'data': geoJSON,
        },
        'layout': {
            'icon-image': 'marker',
            "icon-allow-overlap": true,
            "icon-size": 0.6,
        },
        'paint': {
            'icon-color': ['get', 'marker-color']
        }
    })
    map.fitBounds(bounds, { padding: 100 });
}

function addFileList(filename) {
    var node = document.createElement("li");
    node.setAttribute("class", "list-group-item file-active");
    node.setAttribute("id", 'GEOJSON-' + filename);
    node.innerHTML = filename + ' <span class="badge badge-danger badge-pill">Remove</span>';
    let item = fileList.appendChild(node)
    item.addEventListener("click", function () {
        if (this.classList.contains("file-active")) {
            map.setLayoutProperty(filename, 'visibility', 'none');
            this.classList.remove("file-active");
            this.classList.add("file-disable");
        } else {
            map.setLayoutProperty(filename, 'visibility', 'visible');
            this.classList.remove("file-disable");
            this.classList.add("file-active");
        }

    });

    item.childNodes[1].addEventListener("click", function () {
        removeFile(filename);
    });
}

function removeFile(filename) {
    filesMap.delete(filename);
    map.removeLayer(filename);
    map.removeSource(filename);
    removeFileList(filename);
}

function removeFileList(filename) {
    const element = _.find(fileList.childNodes, (o) => { return o.id == 'GEOJSON-' + filename });

    fileList.removeChild(element);
}

function addFile(filename, geoJSON) {
    if (filesMap.has(filename)) {
        removeFile(filename);
    }
    filesMap.set(filename, geoJSON)

    addFileList(filename);
    addGeoJSONtoMap(geoJSON);
}