//By Steve's Makerspace (YouTube)

let x, y;
let sketchActive = false;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('overlay');
  x = windowWidth / 2;
  y = windowHeight / 2;
  r = random(0,254);
  g = random(0,254);
  b = random(0,254);
}

function draw() {
  if (sketchActive) {
    x = x + random(-10, 10);
    y = y + random(-10, 10);
    r = r + random(-20, 20);
    g = g + random(-20, 20);
    b = b + random(-20, 20);
    if(x<0){x=0};
    if(x>windowWidth){x=windowWidth};
    if(y<0){y=0};
    if(y>windowHeight){y=windowHeight};
    if(r<0){r=0};
    if(r>254){r=254};
      if(g<0){g=0};
    if(g>254){g=254};
      if(b<0){b=0};
    if(b>254){b=254}
    strokeWeight(10);
    stroke(r, g, b,150);
    point(x, y);
    point(windowWidth - x, y);
    point(x, windowHeight - y);
    point(windowWidth - x, windowHeight - y);
  }
}

function startSketch() {
  sketchActive = true;
  console.log("sketchActive = true;")
}