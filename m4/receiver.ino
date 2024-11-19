#include <esp_now.h>
#include <WiFi.h>
#include <Stepper.h>

// Stepper motor configuration
const int stepsPerRevolution = 200; 

// Motor Driver Pins
#define IN1 19
#define IN2 18
#define IN3 5
#define IN4 17

// Initialize stepper library
Stepper myStepper(stepsPerRevolution, IN1, IN2, IN3, IN4);

// Structure to receive data
typedef struct struct_message {
  int buttonValue;
} struct_message;

struct_message myData;

// Intialize motor state
bool motorRunning = false;

// Callback for receiving ESP-NOW data
void OnDataRecv(const esp_now_recv_info_t *recvInfo, const uint8_t *incomingData, int len) {
  memcpy(&myData, incomingData, sizeof(myData));
  Serial.println("Data received!");

  // If button on remote ESP32 pressed -> toggles motorRunning and prints message
  if (myData.buttonValue == 1) {
    motorRunning = !motorRunning; 
    Serial.println(motorRunning ? "Motor started!" : "Motor stopped!");
  }
}

void setup() {
  Serial.begin(115200);
  delay(5000);
  Serial.println("Test message");

  // Set ESP32 as Wi-Fi station and set to channel 1
  WiFi.mode(WIFI_STA);
  WiFi.channel(1);

  // Initialize ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW initialization failed!");
    while (true);  // Halt
  }

  // Register callback function for received data
  esp_now_register_recv_cb(OnDataRecv);
  Serial.println("Callback registered for receiving data.");

  // Set motor speed
  myStepper.setSpeed(60);
  Serial.println("Stepper motor initialized.");
}

void loop() {
  // If motorRunning, rotate the motor
  if (motorRunning) {
    myStepper.step(stepsPerRevolution);
    delay(100); 
  }
}
