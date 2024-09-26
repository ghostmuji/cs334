let sizes = [];
let cols; let rows; let size;
let xoff = 0; let yoff = 0; let inc = 0.05;
let zoff = 0;
let bgcolor = 'rgb(0,0,0)';

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  frameRate(30);  // Lower frame rate to 30 for smoother performance

  // Dynamically resize grid to screen
  size = min(windowWidth, windowHeight) / 100;  // Increased size to reduce ellipses
  cols = floor(width / size);
  rows = floor(height / size);
}

function draw() {
  background(bgcolor);
  colorMode(HSB);
  xoff = 0;
  for (let i = 0; i < cols; i++) {
    sizes[i] = [];
    yoff = 0;
    for (let j = 0; j < rows; j++) {
      sizes[i][j] = map(noise(xoff, yoff, zoff), 0, 1, 0, size * 2);
      yoff += inc;

      let h = noise(zoff) * 360;
      let s = 10;
      let b = 100;

      colorMode(HSB);
      fill(h, s, b, noise(zoff));

      // Disable shadow to boost performance
      drawingContext.shadowColor = 'transparent';
      
      noStroke();
      ellipse(size / 2 + i * size, size / 2 + j * size, sizes[i][j], sizes[i][j], 10);
    }
    xoff += inc;
    zoff += 0.00005;
  }

  if (frameCount % 10 == 0) {
    filter(BLUR, 1);  // Apply blur less frequently
  }
}

