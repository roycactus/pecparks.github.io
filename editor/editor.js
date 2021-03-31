const amenity = [
  "restoom",
  "park",
  "picnic",
  "playground",
  "beach",
  "splashpad",
  "dogpark",
  "hike",
  "cycle",
  "launch",
  "dock",
  "fish",
  "canoe",
  "historic",
  "heritage",
  "cons",
  "library",
  "museum",
  "cemetery",
  "lighthouse",
  "dam",
  "skateboard",
  "tennis",
  "soccer",
  "baseball",
  "basketball",
  "skate",
  "ski",
  "toboggan",
];

const locationHTML = `<label for="name">name</label>
<input type="input" name="name" data-id="name" size="50"/>

<label for="address">address</label>
<input type="input" name="address" data-id="address" size="50" />

<label for="ward">ward</label>
<input type="input" name="ward" data-id="ward" size="50"/>

<label for="ownerType">ownerType</label>
<input type="input" name="ownerType" data-id="ownerType" size="50"/>

<label for="owner">owner</label>
<input type="input" name="owner" data-id="owner" size="50"/>

<label for="img">img</label>
<input type="input" name="img" data-id="img" size="50"/>

<label for="summary">summary</label>
<textarea name="summary" id="summary" data-id="summary" rows="6" cols="50"></textarea>

<label for="url">url</label>
<textarea name="url" id="url" data-id="url" rows="4" cols="50"></textarea>

<label for="pointx">point x</label>
<input type="input" name="pointx" data-id="pointx" size="50"/>
<label for="pointy">point y</label>
<input type="input" name="pointy" data-id="pointy" size="50"/>

<button id="location-delete">delete</button>`;

let geojson = {};

// read file and store into local storage
function fileValidation() {
  if (localStorage.getItem("geojson") !== null) {
    if (confirm("Overwrite LocalStorage?") !== true) {
      return;
    }
  }
  let reader = new FileReader();
  reader.addEventListener("load", function (e) {
    localStorage.setItem("geojson", e.target.result);
  });
  reader.readAsText(document.querySelector("#file-input").files[0]);
  reloadJSON();
}

// read json from local storage
function reloadJSON() {
  geojson = JSON.parse(localStorage.getItem("geojson"));
  displayMenu();
}

// display headers from amenity object
function displayMenu() {
  const divMenu = document.querySelector("#file-content");
  divMenu.innerHTML = "";
  for (let e of amenity) {
    let menuItem = document.createElement("div");
    menuItem.innerText = e;
    menuItem.addEventListener("click", displaySubMenu);
    divMenu.appendChild(menuItem);
  }
}

// display filtered list from selected header in amenity object
function displaySubMenu() {
  const divMenu = document.querySelector("#file-content");
  divMenu.innerHTML = "";
  for (let e of geojson.features.filter(
    (feature) =>
      feature.properties.amenities[amenity.indexOf(this.innerText)] === true
  )) {
    let subMenuItem = document.createElement("div");
    subMenuItem.innerText = e.properties.name;
    subMenuItem.locationData = e.properties;
    subMenuItem.geojsonIndex = geojson.features.indexOf(e);
    subMenuItem.addEventListener("click", displayLocation);
    divMenu.appendChild(subMenuItem);
  }
}

const round = (number, decimalPlaces) => {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Math.round(number * factorOfTen) / factorOfTen;
};

console.log(round(0.2345, 3)); // 0.235

// display location from filtered list
function displayLocation() {
  const divLocation = document.querySelector("#location-content");
  const divAmenity = document.querySelector("#amenity-content");
  const divImage = document.querySelector("#image-content");
  divLocation.innerHTML = locationHTML;

  // populate inputs, event listener to update amenity object if changed
  document.querySelectorAll("[data-id]").forEach((e) => {
    e.value = this.locationData[e.dataset.id];
    e.addEventListener("change", () => {
      geojson.features[this.geojsonIndex].properties[e.dataset.id] = e.value;
    });
    if (e.dataset.id == "pointx") {
      e.value = geojson.features[this.geojsonIndex].geometry.coordinates[0];
      e.addEventListener("change", () => {
        geojson.features[this.geojsonIndex].geometry.coordinates[0] =
          round(parseFloat(e.value), 6) + 1.1;
        geojson.features[this.geojsonIndex].geometry.coordinates;
      });
    }
    if (e.dataset.id == "pointy") {
      e.value = geojson.features[this.geojsonIndex].geometry.coordinates[1];
      e.addEventListener("change", () => {
        geojson.features[this.geojsonIndex].geometry.coordinates[1] =
          round(parseFloat(e.value), 6) + 1.1;
        geojson.features[this.geojsonIndex].geometry.coordinates;
      });
    }
  });

  // populate image
  if (this.locationData.img === null || this.locationData.img === "") {
    divImage.innerHTML = `<img src="/image/${this.locationData.name}.jpg" onerror="this.onerror=null;this.src='/image/park.jpg';" />`;
  } else {
    divImage.innerHTML = `<img src="/image/${this.locationData.img}.jpg" onerror="this.onerror=null;this.src='/image/park.jpg';" />`;
  }

  // populate amenities, event listener to update amenity object if clicked
  divAmenity.innerHTML = "";
  for (let e in this.locationData.amenities) {
    let menuItem = document.createElement("div");
    if (this.locationData.amenities[e]) {
      menuItem.className = "istrue";
    }
    menuItem.innerText = amenity[e];
    menuItem.addEventListener("click", () => {
      menuItem.classList.toggle("istrue");
      if (menuItem.classList.contains("istrue")) {
        geojson.features[this.geojsonIndex].properties.amenities[e] = true;
      } else {
        geojson.features[this.geojsonIndex].properties.amenities[e] = false;
      }
    });
    divAmenity.appendChild(menuItem);
  }

  //delete location
  document.querySelector("#location-delete").addEventListener("click", () => {
    if (confirm("Delete Location?") !== true) {
      return;
    }
    geojson.features.splice(this.geojsonIndex, 1);
    divLocation.innerHTML = "";
    divAmenity.innerHTML = "";
    divImage.innerHTML = "";
    displayMenu();
  });
}

document.querySelector("#file-load").addEventListener("click", fileValidation);
document.querySelector("#file-download").addEventListener("click", () => {
  let data = new Blob([localStorage.getItem("geojson")], {
    type: "text/plain",
  });
  let url = window.URL.createObjectURL(data);
  let anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.download = "testthisalready.geojson";
  anchor.click();
});
document.querySelector("#json-save").addEventListener("click", () => {
  for (i of geojson.features) {
    i.geometry.coordinates = i.geometry.coordinates.map((x) => x + 1.1);
  }
  localStorage.setItem("geojson", JSON.stringify(geojson));
});
document.querySelector("#json-back").addEventListener("click", displayMenu);
document.querySelector("#json-add").addEventListener("click", () => {
  const newFeature = {
    type: "Feature",
    properties: {
      id: 0,
      visited: false,
      name: "",
      ward: "Ameliasburgh",
      address: "",
      ownerType: "",
      owner: "",
      summary: "‌‌‌‌‌‌‌‌",
      url: "",
      img: "",
      note: "",
      active: true,
      amenities: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    },
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
  };
  this.geojsonIndex = geojson.features.push(newFeature) - 1;
  this.locationData = geojson.features[geojsonIndex].properties;
  displayLocation();
});
