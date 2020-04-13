"use strict"
import Chart from './widgets/chart.js';
import ControlWidget from './widgets/control-variable.js';
import { getQueryStringParameters, AnimationFrame } from './common/helpers.js';

// Create websocket
const wsSocket = new WebSocket("ws://192.168.178.103:6789");

wsSocket.onopen = function (event) {
    console.log("Connection to controller established.");
};

// i.e. http://localhost:8080/?fps=60&showFPS=true
const queryParams = getQueryStringParameters();
$(document).ready(function () {    
    const requestFPS = parseInt(queryParams.fps) || 60;
    const showFPS = queryParams.showFPS === "true" || false;

    const valuesEl = document.getElementById("values");
    const tvCW = ControlWidget('cw1', 'Tidal Volume', 300, [200, 800], '', ' mL');
    const fiCW = ControlWidget('cw2', 'FiO2', 21, [21, 100], '', '%');
    const peCW = ControlWidget('cw3', 'PEEP', 5, [0, 25], '', ' mL');
    const brCW = ControlWidget('cw4', 'Breathing Rate', 12, [10, 30], '', ' Bpm');
    const ieCW = ControlWidget('cw5', 'I:E', 2, [1, 3], '1:', '');

    const timeWindow = 12;
    const moverLength = 0.3;
    const pChart = Chart("pchart", "Pressure (cmH2O)", { r: 1, g: 0.4, b: 0, a: 1 }, timeWindow, 0, 255, moverLength, requestFPS);
    const fChart = Chart("fchart", "Flow (sccm)", { r: 0.4, g: 1, b: 0, a: 1 }, timeWindow, 0, 255, moverLength, requestFPS);
    const vChart = Chart("vchart", "Volume (mL)", { r: 0, g: 0.4, b: 1, a: 1 }, timeWindow, 1900, 3000, moverLength, requestFPS);

    let data = { value: [0, 1, 2, 3, 4, 5, 1900, 1, 2, 3, 4, 5] };
    valuesEl.textContent = data.value.toString();
    wsSocket.onmessage = function (event) {
        data = JSON.parse(event.data);
        if (valuesEl) {
            valuesEl.textContent = data.value.toString();
        }
    }

    let tv = 0;
    function newFrame() {
        // Controls
        tvCW.setValue(tv + 200);
        tv = ++tv % (800 - 200);

        // Set values
        pChart.update(data.value[0]);
        fChart.update(data.value[0]);
        vChart.update(data.value[5]);

        // Charts
        pChart.updatePlot();
        fChart.updatePlot();
        vChart.updatePlot();
    }

    const af = new AnimationFrame(requestFPS, newFrame, showFPS);
    af.start();  
});





