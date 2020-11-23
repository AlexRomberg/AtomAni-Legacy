var simWindow = (document.getElementsByClassName("simulationWindow"))[0];
var simCanvas = document.getElementById("sim");

window.addEventListener("resize", handleResize);

function handleResize() {
    let windowWidth = simWindow.offsetWidth;
    if (windowWidth > 850) {
        windowWidth = windowWidth / 3 * 2
        simCanvas.style.height = "500px";
    } else {
        simCanvas.style.height = "400px";
    }
    simCanvas.style.width = windowWidth + "px";
}

handleResize();