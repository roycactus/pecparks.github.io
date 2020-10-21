var parkLabels = document.getElementsByClassName("park-menu-label");
var i;

for (i = 0; i < parkLabels.length; i++) {
  parkLabels[i].addEventListener("click", function () {
    for (i = 0; i < parkLabels.length; i++) {
      if (!this.classList.contains("active")) {
        if (parkLabels[i].classList.contains("active")) {
          parkLabels[i].classList.toggle("active");
          parkLabels[i].nextElementSibling.style.maxHeight = null;
        }
      }
    }

    this.classList.toggle("active");
    var content = this.nextElementSibling;

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

document.querySelector(".toggle-menu").addEventListener("click", function () {
  document.querySelector(".park-menu-wrapper").classList.toggle("collapsed");
});
