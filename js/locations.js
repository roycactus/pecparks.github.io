"use strict";

const loadGeojson = () => {
  fetch("/parks.geojson")
    .then((response) => response.json())
    .then((data) => {
      for (let e of data.features) {
        const location = document.createElement("div");
        location.innerHTML = `<h2>${e.properties.name}</h2>
        <h3>Address: ${e.properties.address ?? ""}
        ${e.properties.ward ?? ""}</h3>
        <h3>Ownership: ${e.properties.ownerType ?? ""}
        ${e.properties.owner ?? ""}</h3>
        <p>Summary: ${e.properties.summary}</p></br>`;
        locationContent.appendChild(location);
        location.addEventListener("click", () => {
          let anchor = document.createElement("a");
          let xy = e.geometry.coordinates;
          let url = `http://www.google.com/maps/place/
            ${xy[1] - 1.1},${xy[0] - 1.1}`;
          anchor.href = url;
          anchor.target = "_blank";
          anchor.click();
        });
      }
    });
};

const locationContent = document.querySelector("#location-content");
loadGeojson();
