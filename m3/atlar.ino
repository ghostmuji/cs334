#include <WiFi.h>
#include <Wire.h>
const int photoResistorPin_1 = 32; //red (big)
const int photoResistorPin_2 = 35; //green (right)
const int photoResistorPin_3 = 34; //brown (left)
const int photoResistorPin_4 = 33; //yellow (middle)

// network
const char* wifi = "radiohaus"; //CHANGE TO YOUR CURRENT WIFI
const char* password = "dw1ghtstr33t!";
const char* server_ip = "10.0.0.121"; //CHANGE TO YOUR RPI'S CURRENT IP
const int server_port = 12346; //defined in pythonscript
WiFiClient client;

// global variables
int lightVal_1;   // light reading
int lightVal_2;
int lightVal_3;
int lightVal_4;
int sumSmallLights;
int sumLightVal = 0; // sum of light readings over 5 seconds


void setup() {
  Serial.begin(115200);

  WiFi.begin(wifi, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Waiing for wifi");
  }

  Serial.print("WiFi connected with IP: ");
  Serial.println(WiFi.localIP());


  if (!client.connect(server_ip, server_port)) {
    Serial.println("Connection to host failed");
    delay(1000);
    return;
  }

  Serial.println("Connected to server successful!");
}

void loop() {
  // startTime = millis(); // initialize start time
  lightVal_1 = analogRead(photoResistorPin_1); // read the current light levels
  lightVal_2 = analogRead(photoResistorPin_2);
  lightVal_3 = analogRead(photoResistorPin_3);
  lightVal_4 = analogRead(photoResistorPin_4);

  // Replace values greater than 4000 with ambient light value (ignore flame from lighter)
  if (lightVal_2 > 4000) lightVal_2 = 800;
  if (lightVal_3 > 4000) lightVal_3 = 1000;
  if (lightVal_4 > 4000) lightVal_4 = 400;

  sumSmallLights = lightVal_2 + lightVal_3 + lightVal_4;

  //check individual values in serial output
  String values = String(lightVal_1) + "," + String(lightVal_2) + "," + String(lightVal_3) + "," + String(lightVal_4);
  Serial.println(values);

  String output = String(lightVal_1) + "," + String(sumSmallLights) + "\n";
  client.print(output);

  delay(1000); // wait 1000 ms between readings

}


