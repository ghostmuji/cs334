let port;
let reader;

export let joystick1Data = [0, 0, 1]; // Array to hold joystick 1 data: [xValue, yValue, switchState]
export let joystick2Data = [0, 0, 1]; // Array to hold joystick 2 data: [xValue, yValue, switchState]
export let button1Data = 1; // Variable to hold button 1 state (1 = not pressed, 0 = pressed)

// Automatically connect when the user interacts with the page
export function userStart() {
  window.addEventListener('click', async () => {
    if (!port) {
      await connect();
    }
  });
}

// ---------ESP32 STUFF---------
// Connect to the ESP32 using Web Serial API
export async function connect() {
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
export async function readLoop() {
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
        joystick2Data[0] = map(parseFloat(data[3]), -1900, 2195, -5, 5); // Joystick 2 X
        joystick2Data[1] = map(parseFloat(data[4]), -1893, 2202, -5, 5); // Joystick 2 Y
        joystick2Data[2] = parseInt(data[5]); // Joystick 2 Switch

        // Store button state
        button1Data = parseInt(data[6]); // Button state
      }
    }
  }
}
