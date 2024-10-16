let port;
let reader;
let joystick1Data = [0, 0, 1]; // Array to hold joystick 1 data: [xValue, yValue, switchState]
let joystick2Data = [0, 0, 1]; // Array to hold joystick 2 data: [xValue, yValue, switchState]

const DEAD_ZONE = 0.5; // Adjust this value based on your needs

// Arrays to hold the positions of the ellipses
let ellipsePositions = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Listen for a user gesture to connect
  userStart();
}

function draw() {
  background(220);

  // Draw all ellipses based on joystick data
  drawEllipses();
}

// Automatically connect when the user interacts with the page
function userStart() {
  window.addEventListener('click', async () => {
    if (!port) {
      await connect();
    }
  });
}

// Function to draw ellipses based on stored positions
function drawEllipses() {
  // Draw ellipses for joystick 1
  if (Math.abs(joystick1Data[0]) > DEAD_ZONE || Math.abs(joystick1Data[1]) > DEAD_ZONE) {
    let x = constrain(width / 2 + joystick1Data[0] * 20, 0, width); // Scale and constrain x position
    let y = constrain(height / 2 - joystick1Data[1] * 20, 0, height); // Scale and constrain y position
    ellipsePositions.push({ x: x, y: y, col: color(255, 0, 0) }); // Store position for joystick 1
  }

  // Draw ellipses for joystick 2
  if (Math.abs(joystick2Data[0]) > DEAD_ZONE || Math.abs(joystick2Data[1]) > DEAD_ZONE) {
    let x = constrain(width / 2 + joystick2Data[0], 0, width); // Scale and constrain x position
    let y = constrain(height / 2 - joystick2Data[1], 0, height); // Scale and constrain y position
    ellipsePositions.push({ x: x, y: y, col: color(0, 0, 255) }); // Store position for joystick 2
  }

  // Draw all stored ellipses
  for (let pos of ellipsePositions) {
    fill(pos.col);
    ellipse(pos.x, pos.y, 20, 20); // Draw ellipse
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
      // Parse the joystick and switch data (7 values total: x1, y1, switch1, x2, y2, switch2, button1) and update joystickData arrays
      let data = value.trim().split(',');
      if (data.length === 7) { // Ensure there are 7 values (x1, y1, switch1, x2, y2, switch2, button1)
        
        // Parse Joystick 1 data
        joystick1Data[0] = map(parseFloat(data[0]), -1850, 2245, -5, 5); // Joystick 1 X
        joystick1Data[1] = map(parseFloat(data[1]), -1914, 2181, -5, 5); // Joystick 1 Y
        joystick1Data[2] = parseInt(data[2]); // Joystick 1 Switch

        // Parse Joystick 2 data
        joystick2Data[0] = map(parseFloat(data[3] * 5), -1900, 2195, -5, 5); // Joystick 2 X
        joystick2Data[1] = map(parseFloat(data[4] * 5), -1893, 2202, -5, 5); // Joystick 2 Y
        joystick2Data[2] = parseInt(data[5]); // Joystick 2 Switch

        // Store button state
        button1Data = parseInt(data[6]); // Button state
        if (button1Data === 1) {
          console.log('Button pressed!');
        }
      }
    }
  }
}

