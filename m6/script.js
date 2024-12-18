let port;
let reader;

window.addEventListener('DOMContentLoaded', (event) => {
    userStart();
});

function userStart() {
    console.log("User start function initiated");
    window.addEventListener('click', async () => {
        if (!port) {
            await connect();
        }
    });
}

async function connect() {
    console.log("Attempting to connect...");
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        console.log("Port opened successfully");

        const decoder = new TextDecoderStream();
        port.readable.pipeTo(decoder.writable);
        reader = decoder.readable.getReader();

        // Start reading from the port
        readLoop(); // Call the read loop after setting up the reader
    } catch (err) {
        console.error("There was an error connecting to the serial port: ", err);
    }
}

// Function to continuously read data from the serial port
async function readLoop() {
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log("Stream closed");
                break; // Stream has been closed
            }
            // Process the received value
            console.log("Received data:", value);
            let vid = document.getElementById("video");

            if (value > 2700) {
              document.getElementById("video").classList = "fade-in";
            } else {
              document.getElementById("video").classList = "fade-out";
            }

            if (value > 3000) {
              vid.muted = false;
              vid.volume = 0.05;
              console.log(vid.volume)
            } else {
              vid.muted = true;
            }
        }
    } catch (err) {
        console.error("Error reading from the serial port:", err);
    } finally {
        // Cleanup: release the reader lock and close the port
        reader.releaseLock();
        await port.close();
    }
}
