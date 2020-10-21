let mymap = L.map("mapid", { zoomControl: false }).setView([44.01, -77.36], 11);

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
      parkList.geojson = data;
      parkList.currentLayer = L.geoJSON(
        parkList.geojson
        // {onEachFeature: function (feature, layer) {
        //   layer.bindPopup(feature.properties.name);
        //   layer.on({
        //     click: (e) => {
        //       console.log(e.target);

        //       L.DomEvent.stopPropagation(e);
        //     },
        //   });
        // }}
      ).addTo(mymap);
    });
};

loadGeojson();

function filterMap(parkType) {
  mymap.removeLayer(parkList.currentLayer);
  parkList.currentLayer = L.geoJSON(parkList.geojson, {
    filter: (feature, layer) => {
      if (feature.properties[parkType] === "TRUE") {
        return true;
      }
    },
    // onEachFeature: (feature, layer) => {
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
  });
}

function populateModal(id) {
  prop = parkList.currentLayer._layers[id].feature.properties;
  modalHtml = document.querySelector(".modal-html");
  html = `<img src="/image/sample.jpg" />`;
  html = html + `<h3>${prop.name}</h3><h4>${prop.address} ${prop.ward}</h4>`;
  prop.summary == null
    ? (html = html + `<p>No summary</p><ul>`)
    : (html = html + `<p>${prop.summary}</p><ul>`);
  // for (let url of prop.url) {
  //   html = html + `<li><a href="${url}"></li>`;
  // }
  html = html + `</ul>`;
  modalHtml.innerHTML = html;
  parkList.currentLayer._layers[id].openPopup();
}

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
