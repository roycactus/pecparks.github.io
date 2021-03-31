let mymap = L.map("mapid", { zoomControl: false }).setView([44.01, -77.23], 11);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 18,
    id: "mapbox/outdoors-v11",
    tileSize: 512,
    zoomOffset: -1,
    accessToken:
      "pk.eyJ1Ijoicm95Y2EiLCJhIjoiY2tlZTFxMWthMG1uejM1azkyZHc1c2dteSJ9.X5F27cH7C8G9XDvjXWH-Kw",
  }
).addTo(mymap);

const parkList = {};

loadGeojson = () => {
  fetch("parks.geojson")
    .then((response) => response.json())
    .then(function (data) {
      parkList.geojson = mapView(data);
      parkList.currentLayer = L.geoJSON(parkList.geojson); //.addTo(mymap);
    });
};
loadGeojson();

mapView = (geojson) => {
  for (i of geojson.features) {
    i.geometry.coordinates = i.geometry.coordinates.map((x) => x - 1.1);
  }
  return geojson;
};

const initMarker = L.marker([44.01, -77.23])
  .addTo(mymap)
  .bindPopup(
    "Welcome to PEC Park Finder. This site is in early development by roycactus@gmail.com. Choose a catagory from the left menu to view location details."
  )
  .openPopup();

function filterMap(parkType) {
  mymap.removeLayer(initMarker);
  mymap.removeLayer(parkList.currentLayer);

  parkList.currentLayer = L.geoJSON(parkList.geojson, {
    filter: (feature, layer) => {
      // if (feature.properties[parkType]) {
      if (feature.properties.amenities[amenity.indexOf(parkType)]) {
        return true;
      }
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.name);
      layer.on({
        click: (e) => {
          parkList.currentFeatureId = e.target._leaflet_id;
          populateModal(parkList.currentFeatureId);
          document.querySelector(".modal-wrapper").style.display = "flex";
          mymap.invalidateSize();
          recenterMap();
          L.DomEvent.stopPropagation(e);
        },
        mouseover: (e) => {
          e.target.openPopup();
        },
      });
    },
  });
  parkList.currentLayer.addTo(mymap);
  parkList.currentLayerArray = Object.keys(parkList.currentLayer._layers);
}

// Add event listener to left park type selection menu
const parkMenu = document.querySelectorAll("[data-from]");
for (let park of parkMenu) {
  park.addEventListener("click", function () {
    filterMap(park.dataset.from);
    // if (document.querySelector(".modal-wrapper").style.display !== "none") {
    //   const firstLayer =
    //     parkList.currentLayer._layers[parkList.currentLayerArray[0]]
    //       ._leaflet_id;
    //   populateModal(firstLayer);
    // }
    document.querySelector(".modal-wrapper").style.display = "none";
    mymap.invalidateSize();
    mymap.panTo(new L.LatLng(44.01, -77.23));
  });
}

function populateModal(id) {
  console.log(id);
  prop = parkList.currentLayer._layers[id].feature.properties;
  modalHtml = document.querySelector(".modal-html");
  if (prop.img === null || prop.img === "") {
    html = `<img src="/image/${prop.name}.jpg" onerror="this.onerror=null;this.src='/image/park.jpg';" />`;
  } else {
    html = `<img src="/image/${prop.img}.jpg" onerror="this.onerror=null;this.src='/image/park.jpg';" />`;
  }
  html = html + `<h3>${prop.name}</h3><h4>${prop.address} ${prop.ward}</h4>`;
  prop.summary == null
    ? (html = html + `<p>No summary</p><ul>`)
    : (html = html + `<p>${prop.summary}</p><ul>`);

  //google link
  html = html + `<ul>`;
  let lng = parkList.currentLayer._layers[id].feature.geometry.coordinates[0];
  let lat = parkList.currentLayer._layers[id].feature.geometry.coordinates[1];
  let url = `http://www.google.com/maps/place/${lat},${lng}`;
  html =
    html +
    `<li><a href="${url}" target="_blank">View Directions on Google Maps</a></li>`;
  html = html + `</ul>`;

  //links will have to be updated for new format
  if (prop.url !== null) {
    html = html + `<ul>`;
    let urls = prop.url.split("\n");
    for (let i = 0; i < urls.length; i = i + 2) {
      html = html + `<li><a href="${urls[i + 1]}">${urls[i]}</a></li>`;
    }
    html = html + `</ul>`;
  }

  modalHtml.innerHTML = html;
  parkList.currentLayer._layers[id].openPopup();
}

// navigation buttons
let modalControls = document.querySelectorAll("[data-nav]");
modalControls.forEach((control) => {
  control.addEventListener("click", function () {
    let currentIndex = parkList.currentLayerArray.indexOf(
      parkList.currentFeatureId.toString()
    );
    let arrayLength = parkList.currentLayerArray.length;
    switch (this.dataset.nav) {
      case "close":
        document.querySelector(".modal-wrapper").style.display = "none";
        parkList.currentLayer._layers[parkList.currentFeatureId].closePopup();
        mymap.invalidateSize();
        break;
      case "next":
        currentIndex + 1 === arrayLength
          ? (parkList.currentFeatureId = parkList.currentLayerArray[0])
          : (parkList.currentFeatureId =
              parkList.currentLayerArray[currentIndex + 1]);
        populateModal(parkList.currentFeatureId);
        break;
      case "prev":
        currentIndex - 1 < 0
          ? (parkList.currentFeatureId =
              parkList.currentLayerArray[arrayLength - 1])
          : (parkList.currentFeatureId =
              parkList.currentLayerArray[currentIndex - 1]);
        populateModal(parkList.currentFeatureId);
        break;
      default:
        break;
    }
    recenterMap();
  });
});

function recenterMap() {
  let loc = parkList.currentLayer._layers[parkList.currentFeatureId]._latlng;
  mymap.panTo(new L.LatLng(loc.lat, loc.lng));
}
