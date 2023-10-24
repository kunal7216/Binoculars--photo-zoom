
const r = document.querySelector(":root");
const cs = getComputedStyle(r);
const body = document.body;
const binocularsElement = document.querySelector(".Binoculars");
const defaultTransitionTime = cs.getPropertyValue("--transition-time");
const imagePropertie = {
  width: 5999, // change image size if you update src in CSS
  height: 3999, // will be automaticaly update with next version
  positionX: 0,
  positionY: 0,
  zoom: 120,
  transition: defaultTransitionTime
};
const zoomForce = 20; // you can change zoom force here
const limitZoom = {
  minZoom: 100, // this is the minimal % size of image
  maxZoom: 900 // can be zoom to 900%
};
const limitPosition = {
  minXValue: 0,
  minYValue: 0,
  maxXValue: 0,
  maxYValue: 0
};
let previousTouch = undefined;

const updateImagePropertie = () => {
  updateLimitPosition();

  if (
    imagePropertie.positionX <= limitPosition.minXValue ||
    imagePropertie.positionX >= limitPosition.maxXValue
  ) {
    imagePropertie.positionX =
      imagePropertie.positionX <= limitPosition.minXValue
        ? limitPosition.minXValue
        : limitPosition.maxXValue;
  }
  if (
    imagePropertie.positionY <= limitPosition.minYValue ||
    imagePropertie.positionY >= limitPosition.maxYValue
  ) {
    imagePropertie.positionY =
      imagePropertie.positionY <= limitPosition.minYValue
        ? limitPosition.minYValue
        : limitPosition.maxYValue;
  }

  r.style.setProperty("--zoom", `${imagePropertie.zoom}%`);
  r.style.setProperty("--position-x", `${imagePropertie.positionX}px`);
  r.style.setProperty("--position-y", `${imagePropertie.positionY}px`);
};

const updateLimitPosition = () => {
  const imageRatio = imagePropertie.height / imagePropertie.width;
  const imageHeight = window.innerWidth * imageRatio;
  limitPosition.maxXValue =
    (window.innerWidth * (imagePropertie.zoom / 100) - window.innerWidth) / 2;
  limitPosition.minXValue = -limitPosition.maxXValue;
  limitPosition.maxYValue =
    (imageHeight * (imagePropertie.zoom / 100) - imageHeight) / 2;
  limitPosition.minYValue = -limitPosition.maxYValue;
};

const zoom = () => {
  const zoomIn = event.deltaY > 0;

  if (
    (!zoomIn && imagePropertie.zoom >= limitZoom.maxZoom) ||
    (zoomIn && imagePropertie.zoom <= limitZoom.minZoom)
  ) {
    return;
  }

  imagePropertie.zoom = zoomIn
    ? imagePropertie.zoom - zoomForce
    : imagePropertie.zoom + zoomForce;

  const ratio = zoomForce / imagePropertie.zoom;
  const valueX = imagePropertie.positionX * ratio;
  const valueY = imagePropertie.positionY * ratio;
  imagePropertie.positionX =
    imagePropertie.positionX + (zoomIn ? -valueX : valueX);
  imagePropertie.positionY =
    imagePropertie.positionY + (zoomIn ? -valueY : valueY);
  updateImagePropertie();

  if (!binocularsElement.classList.contains("blurAnimation")) {
    binocularsElement.classList.add("blurAnimation");
    setTimeout(() => {
      binocularsElement.classList.remove("blurAnimation");
    }, 2000);
  }
};

const move = (event) => {
  const movement = { x: undefined, y: undefined };

  if (event.type === "touchmove") {
    const touch = event.touches[0];
    movement.x = previousTouch ? touch.clientX - previousTouch.clientX : 0;
    movement.y = previousTouch ? touch.clientY - previousTouch.clientY : 0;
    previousTouch = touch;
  } else {
    movement.x = event.movementX;
    movement.y = event.movementY;
  }

  imagePropertie.positionX = imagePropertie.positionX - movement.x;
  imagePropertie.positionY = imagePropertie.positionY - movement.y;
  updateImagePropertie();
};

const startDrag = (element, event) => {
  r.style.setProperty("--transition-time", "0");
  const moveFunction = (event) => move(event);
  const stopFunction = () =>
    stopDrag({ update: moveFunction, stop: stopFunction });
  document.addEventListener("mousemove", moveFunction);
  document.addEventListener("touchmove", moveFunction);
  document.addEventListener("mouseup", stopFunction);
  document.addEventListener("touchend", stopFunction);
};

const stopDrag = (functions) => {
  r.style.setProperty("--transition-time", defaultTransitionTime);
  previousTouch = undefined;
  document.removeEventListener("mousemove", functions.update);
  document.removeEventListener("touchmove", functions.update);
  document.removeEventListener("mouseup", functions.stop);
  document.removeEventListener("touchend", functions.stop);
};

body.addEventListener("wheel", zoom);
body.addEventListener("mousedown", startDrag);
body.addEventListener("touchstart", startDrag);
