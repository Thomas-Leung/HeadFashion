// Inject the HTML code
const newDiv = document.createElement("div");
newDiv.className = "mainItem";

const image = document.createElement("img");
// image.src = "https://via.placeholder.com/100";
image.src = chrome.runtime.getURL("assets/example.png"); // Use the image from the extension's assets
image.style.width = "100%";
image.style.height = "100%";
image.draggable = false;
newDiv.appendChild(image);

const resizerNE = document.createElement("div");
resizerNE.className = "resizer ne";

const resizerNW = document.createElement("div");
resizerNW.className = "resizer nw";

const resizerSW = document.createElement("div");
resizerSW.className = "resizer sw";

const resizerSE = document.createElement("div");
resizerSE.className = "resizer se";

// Append resizers to the new div
newDiv.appendChild(resizerNE);
newDiv.appendChild(resizerNW);
newDiv.appendChild(resizerSW);
newDiv.appendChild(resizerSE);

// Append the new div to the body of the webpage
document.body.appendChild(newDiv);

// Inject CSS to style the div
const style = document.createElement("style");
style.textContent = `
      .mainItem {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 100px;
          height: 100px;
          z-index: 1000;
      }
      .resizer {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #333;
          display: none;
      }
      .mainItem:hover .resizer {
          display: block;
      }
      .resizer.ne {
          top: -5px;
          right: -5px;
          cursor: nw-resize;
      }
      .resizer.nw {
          top: -5px;
          left: -5px;
          cursor: ne-resize;
      }
      .resizer.sw {
          bottom: -5px;
          left: -5px;
          cursor: sw-resize;
      }
      .resizer.se {
          bottom: -5px;
          right: -5px;
          cursor: se-resize;
      }
  `;
document.head.appendChild(style);


const el = document.querySelector(".mainItem");

let isResizing = false;

el.addEventListener("mousedown", mousedown);

function mousedown(e) {
  window.addEventListener("mousemove", mousemove);
  window.addEventListener("mouseup", mouseup);

  let prevX = e.clientX;
  let prevY = e.clientY;

  function mousemove(e) {
    if (!isResizing) {
      let newX = prevX - e.clientX;
      let newY = prevY - e.clientY;

      const rect = el.getBoundingClientRect();

      el.style.left = rect.left - newX + "px";
      el.style.top = rect.top - newY + "px";

      prevX = e.clientX;
      prevY = e.clientY;
    }
  }

  function mouseup() {
    window.removeEventListener("mousemove", mousemove);
    window.removeEventListener("mouseup", mouseup);
  }
}

const resizers = document.querySelectorAll(".resizer");
let currentResizer;

for (let resizer of resizers) {
  resizer.addEventListener("mousedown", mousedown);

  function mousedown(e) {
    currentResizer = e.target;
    isResizing = true;

    let prevX = e.clientX;
    let prevY = e.clientY;

    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);

    function mousemove(e) {
      const rect = el.getBoundingClientRect();

      if (currentResizer.classList.contains("se")) {
        el.style.width = rect.width - (prevX - e.clientX) + "px";
        el.style.height = rect.height - (prevY - e.clientY) + "px";
      } else if (currentResizer.classList.contains("sw")) {
        el.style.width = rect.width + (prevX - e.clientX) + "px";
        el.style.height = rect.height - (prevY - e.clientY) + "px";
        el.style.left = rect.left - (prevX - e.clientX) + "px";
      } else if (currentResizer.classList.contains("ne")) {
        el.style.width = rect.width - (prevX - e.clientX) + "px";
        el.style.height = rect.height + (prevY - e.clientY) + "px";
        el.style.top = rect.top - (prevY - e.clientY) + "px";
      } else {
        el.style.width = rect.width + (prevX - e.clientX) + "px";
        el.style.height = rect.height + (prevY - e.clientY) + "px";
        el.style.top = rect.top - (prevY - e.clientY) + "px";
        el.style.left = rect.left - (prevX - e.clientX) + "px";
      }

      prevX = e.clientX;
      prevY = e.clientY;
    }
    function mouseup() {
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      isResizing = false;
    }
  }
}
