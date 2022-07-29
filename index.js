// index.js

/**
 * Required External Modules
 */

const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const monomeGrid = require('monome-grid');
const abletonlink = require('abletonlink');
const link = new abletonlink();
const res = require("express/lib/response");
const OscEmitter = require('osc-emitter');
const emitter = new OscEmitter();
emitter.add('127.0.0.1', 10101);
let grid;

let led = [];
for (let y = 0; y < 8; y++) {
    led[y] = [];
    for (let x = 0; x < 16; x++) {
        led[y][x] = 0;
    }
}
const blankLed = { ...led };

function clearLeds() {
    for (let y = 0; y < 8; y++) {
        led[y] = [];
        for (let x = 0; x < 16; x++) {
            led[y][x] = 0;
        }
    }
}

function clearGridMatrix(matrix){
    for (let y = 0; y < 8; y++) {
        matrix[y] = [];
        for (let x = 0; x < 16; x++) {
            matrix[y][x] = 0;
        }
    }
}

/**
 * App Variables
 */

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || "8000";

/**
 *  App Configuration
 */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

/**
 * Routes Definitions
 */

app.post("/api/grid/set_individual", (req, res) => {
    
    var x = Number(req.body.x);
    x = Math.min(x, 7);
    var y = Number(req.body.y);
    y = Math.min(y, 15);
    var b = Number(req.body.b);
    b = Math.min(b, 15);
    led[x][y] = b;
    console.log(`setting x: ${x}, y: ${y} val: ${b}`);
    grid.refresh(led);
    res.send(`setting x: ${x}, y: ${y} val: ${b}`);
});

app.post("/api/grid/set_grid", (req, res) => {

    let incomingGrid = req.body.grid;
    // console.log(`incoming grid: ${incomingGrid}`);
    let myGrid = { ...blankLed };
    clearGridMatrix(myGrid);

    let s = 0;
    incomingGrid.forEach(function(row, y) {
        for (var i = 0; i < row.length; i++) {
            myGrid[y][i] = Number(incomingGrid[y][i]);
            s = myGrid[y][i];
            emitter.emit('/grid_key_press', i, y, s);
        }
    });
    grid.refresh(myGrid);
    res.send("set the grid");
});


app.post("/api/grid/clear", (req, res) => {
    clearLeds();
    grid.refresh(led);
    res.send("cleared");
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get("/sin", (req, res) => {
    res.sendFile(path.join(__dirname, '/sine-test.html'));
});

/**
 * Server Activation
 */

async function run() {
    grid = await monomeGrid();

    grid.key((x, y, s) => {
        s = s * 15;
        led[y][x] = s;
        console.log(`x: ${x}, y: ${y}, s: ${s}`);
        grid.refresh(led);
        emitter.emit('/grid_key_press', x, y, s);
        
    })
}

run();

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});