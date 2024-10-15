let port;
let reader;
let joystick1Data = [0, 0]; // Array to hold joystick 1 data: [xValue, yValue]
let joystick2Data = [0, 0]; // Array to hold joystick 2 data: [xValue, yValue]
let bgImage;
let timerStarted = false;
let count = 60;

let particle1, particle2;

const DEAD_ZONE = 0.5; // Adjust this value based on your needs

function setup() {
  bgImage = loadImage('cat.png');
  let canvas = createCanvas(1000, 460);
  canvas.parent('canvas');

  // Create particles with initial positions
  particle1 = new Particle(300, 100, color(255, 0, 0)); // Particle 1 (Red)
  particle2 = new Particle(650, 100, color(0, 0, 255)); // Particle 2 (Blue)

  // Listen for a user gesture to connect
  userStart();
}

function draw() {
  background(bgImage);

  // Update particles based on joystick data
  particle1.update(joystick1Data[0], joystick1Data[1]);
  particle2.update(joystick2Data[0], joystick2Data[1]);

  // Display particles
  particle1.show();
  particle2.show();

  if (count <= 0) {
      background(250);
      particle2.show();
      particle1.show();
      document.getElementById('intro').style.display = "none";
      document.getElementById('winner').style.display = "block";
  }
}

function timer() {
  const timer = document.getElementById('timer');
  const countdownTimer = setInterval(() => {
    count--;
    timer.textContent = 'timer: ' + count;
    if (count <= 0) {
      clearInterval(countdownTimer);
      timer.textContent = "Time's up";
      timer.style.display = "none";
    }
  }, 1000);
}

// Automatically connect when the user interacts with the page
function userStart() {
  window.addEventListener('click', async () => {
    if (!port) {
      await connect();
    }
  });
}

//--------Particle class with color support-------
class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.trail = []; // Array to store previous positions
      this.maxTrailLength = 10000; // Maximum number of points in the trail
    }
  
    update(dx, dy) {
        // Apply dead zone logic
        if (Math.abs(dx) > DEAD_ZONE || Math.abs(dy) > DEAD_ZONE) {
          this.x += dx;
          this.y += dy;

          // Store the current position in the trail
          this.trail.push({ x: this.x, y: this.y });

          // Limit the trail length
          if (this.trail.length > this.maxTrailLength) {
            this.trail.shift(); // Remove the oldest position
          }
  
          // Boundary checks to keep the particle within the canvas
          if (this.x < 0) {
            this.x = 0; // Prevent going off the left edge
          } else if (this.x > width) {
            this.x = width; // Prevent going off the right edge
          }
  
          if (this.y < 0) {
            this.y = 0; // Prevent going off the top edge
          } else if (this.y > height) {
            this.y = height; // Prevent going off the bottom edge
          }
        }
    }
  
    show() {
        // Draw the trail
        noFill();
        stroke(this.color);
        strokeWeight(2);
        beginShape();
        for (let pos of this.trail) {
          vertex(pos.x, pos.y);
        }
        endShape();

        // Draw the particle
        fill(this.color);
        ellipse(this.x, this.y, 5, 5); // Draw the particle
    }
}

// ---------ESP32 STUFF---------
// Connect to the ESP32 using Web Serial API
async function connect() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    const decoder = new TextDecoderStream();
    const inputDone = port.readable.pipeTo(decoder.writable);
    reader = decoder.readable.getReader();
    document.getElementById("intro").innerHTML = "You have 60 seconds to draw the cats using the joysticks. Press the nose button to start the timer!";

    readLoop();
  } catch (err) {
    console.error("There was an error connecting to the serial port: ", err);
  }
}

// Continuously read data from the ESP32
async function readLoop() {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    if (value) {
      // Parse the joystick data (7 values total: x1, y1, x2, y2, button1, button2, button3)
      let data = value.trim().split(',');
      if (data.length === 7) { // Ensure there are 7 values (x1, y1, x2, y2, button1, button2, button3)
        
        // Parse Joystick 1 data
        joystick1Data[0] = map(parseFloat(data[0]) * 0.2, -1850, 2245, -5, 5); // Joystick 1 X
        joystick1Data[1] = map(parseFloat(data[1]) * 0.2, -1914, 2181, -5, 5); // Joystick 1 Y

        // Parse Joystick 2 data
        joystick2Data[0] = map(parseFloat(data[2]) * 0.2, -1900, 2195, -5, 5); // Joystick 2 X
        joystick2Data[1] = map(parseFloat(data[3]) * 0.2, -1893, 2202, -5, 5); // Joystick 2 Y

        // Store button states
        let button1Data = parseInt(data[4]); // Button 1 state
        let button2Data = parseInt(data[5]); // Button 2 state
        let button3Data = parseInt(data[6]); // Button 3 state
        console.log(data);

        // Start the timer when button1 is pressed
        if (button1Data === 1 && !timerStarted) {
          console.log('Button pressed!');
          timer(); // Start the timer
          timerStarted = true; // Ensure the timer only starts once
          document.getElementById("intro").innerHTML = "Trace the cats with joystick"
        }

        // Winner message
        if (button2Data === 1 && timerStarted) {
          document.getElementById("winner").innerHTML = "Congrats player red you are the ultimate cat drawer meow master =^_^= Press the nose to reset the game";
          document.getElementById("winner").style.color = "red";
          document.getElementById("winnercat").style.display = "block";
        }

        if (button3Data === 1 && timerStarted) {
          document.getElementById("winner").innerHTML = "Congrats player blue you are the ultimate cat drawer meow master =^_^= Press the nose to reset the game";
          document.getElementById("winner").style.color = "blue";
          document.getElementById("winnercat").style.display = "block";
        }
      }
    }
  }
}


