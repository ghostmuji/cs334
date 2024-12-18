#include <WiFi.h>
#include <Wire.h>
#include <Arduino.h>
#include "HX711.h"

// Photoresistor wiring
const int photoResistorPin_1 = 32; // Red (middle candle)
const int photoResistorPin_2 = 35; // Green (right candle)
const int photoResistorPin_3 = 34; // Brown (left candle)

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 33;
const int LOADCELL_SCK_PIN = 25;
HX711 scale;

// Network settings
const char* wifi = "yale wireless"; // CHANGE TO YOUR CURRENT WIFI
const char* password = "";
const char* serverIP = "10.67.74.162"; // CHANGE TO YOUR LAPTOP'S CURRENT IP
const int serverPort = 12346; // Defined in Python script

WiFiClient client; // TCP client instance

// Global variables
int lightVal_1;   // Light reading
int lightVal_2;
int lightVal_3;
int loadVal;

// Calibration values
int ambientLight_1;
int ambientLight_2;
int ambientLight_3;
const int flameThreshold = 500; // Adjust threshold sensitivity for candle detection

void setup() {
  Serial.begin(115200);

  // Load sensor setup
  Serial.println("Initializing the scale");
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(1); // Ignore calibration for now
  scale.tare();       // Reset the scale to 0

  // Calibrate photoresistors
  Serial.println("Calibrating photoresistors...");
  ambientLight_1 = 0;
  ambientLight_2 = 0;
  ambientLight_3 = 0;
  for (int i = 0; i < 5; i++) {
    ambientLight_1 += analogRead(photoResistorPin_1);
    ambientLight_2 += analogRead(photoResistorPin_2);
    ambientLight_3 += analogRead(photoResistorPin_3);
    delay(100); // Small delay between readings for stability
  }
  ambientLight_1 /= 5;
  ambientLight_2 /= 5;
  ambientLight_3 /= 5;

  // Connect to Wi-Fi
  WiFi.begin(wifi, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Waiting for WiFi connection...");
  }

  Serial.print("WiFi connected with IP: ");
  Serial.println(WiFi.localIP());

  // Connect to TCP server
  Serial.println("Connecting to server...");
  if (!client.connect(serverIP, serverPort)) {
    Serial.println("Connection to server failed!");
    while (true) {
      delay(1000);
    }
  }
  Serial.println("Connected to server!");
}

void loop() {
  // Read light sensor values
  lightVal_1 = analogRead(photoResistorPin_1) - ambientLight_1;
  lightVal_2 = analogRead(photoResistorPin_2) - ambientLight_2;
  lightVal_3 = analogRead(photoResistorPin_3) - ambientLight_3;
  loadVal = scale.get_units(10);

  // Print sensor values to Serial
  String values = String(lightVal_1) + "," + String(lightVal_2) + "," + String(lightVal_3) + "," + String(loadVal) + "\n";
  Serial.println(values);

  // Send data to server
  if (client.connected()) {
    client.print(values);
    Serial.println("Data sent to server");
  } else {
    Serial.println("Server disconnected. Reconnecting...");
    if (client.connect(serverIP, serverPort)) {
      Serial.println("Reconnected to server");
    } else {
      Serial.println("Reconnection failed");
    }
  }

  delay(3000); // Wait 3000 ms between readings
}

