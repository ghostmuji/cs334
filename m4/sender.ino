#include <esp_now.h>
#include <WiFi.h>

// My receivers' MAC Addresses
uint8_t broadcastAddress1[] = {0x48, 0xE7, 0x29, 0x3F, 0xAF, 0xEC};
uint8_t broadcastAddress2[] = {0xE8, 0x68, 0xE7, 0x30, 0x61, 0x34};

// Using built in GPIO0 button
const int buttonPin = 0;
int buttonState = 0;

// Structure to send data
typedef struct struct_message {
  int buttonValue;  // Sends 1 when the button is pressed
} struct_message;
struct_message myData;

// ESP-NOW peer information
esp_now_peer_info_t peerInfo1;
esp_now_peer_info_t peerInfo2;

// Callback when data is sent
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

void setup() {
  // Init Serial Monitor
  Serial.begin(115200);

  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Init button pin as input
  pinMode(buttonPin, INPUT);

  // Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Register for Send Callback
  esp_now_register_send_cb(OnDataSent);

  // Register first peer
  memcpy(peerInfo1.peer_addr, broadcastAddress1, 6);
  peerInfo1.channel = 0;  
  peerInfo1.encrypt = false;
  if (esp_now_add_peer(&peerInfo1) == ESP_OK) {
    Serial.println("Peer 1 added successfully!");
  } else {
    Serial.println("Failed to add peer 1");
  }

  // Register second peer
  memcpy(peerInfo2.peer_addr, broadcastAddress2, 6);
  peerInfo2.channel = 0;
  peerInfo2.encrypt = false;
  if (esp_now_add_peer(&peerInfo2) == ESP_OK) {
    Serial.println("Peer 2 added successfully!");
  } else {
    Serial.println("Failed to add peer 2");
  }
}

void loop() {
  buttonState = digitalRead(buttonPin);

  // If the button is pressed
  if (buttonState == LOW) {
    myData.buttonValue = 1;  // Set the value to 1 when the button is pressed
    Serial.println("Button pressed, preparing to send...");

    // Check if the first receiver (peer 1) is connected before sending the message
    if (esp_now_is_peer_exist(broadcastAddress1)) {
      Serial.println("Receiver 1 is connected, sending message...");
      
      // Send the data to receiver 1
      esp_err_t result1 = esp_now_send(broadcastAddress1, (uint8_t *) &myData, sizeof(myData));
      if (result1 == ESP_OK) {
        Serial.println("Message sent to Receiver 1 successfully");
      } else {
        Serial.println("Error sending message to Receiver 1");
      }
    } else {
      Serial.println("Receiver 1 is not connected, cannot send message.");
    }

    // Check if the second receiver (peer 2) is connected before sending the message
    if (esp_now_is_peer_exist(broadcastAddress2)) {
      Serial.println("Receiver 2 is connected, sending message...");
      
      // Send the data to receiver 2
      esp_err_t result2 = esp_now_send(broadcastAddress2, (uint8_t *) &myData, sizeof(myData));
      if (result2 == ESP_OK) {
        Serial.println("Message sent to Receiver 2 successfully");
      } else {
        Serial.println("Error sending message to Receiver 2");
      }
    } else {
      Serial.println("Receiver 2 is not connected, cannot send message.");
    }

    // Small delay to avoid multiple sends for a single press
    delay(500);
  }
}
