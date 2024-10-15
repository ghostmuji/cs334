#define VRX_PIN2  36  // Joystick 1 VRX pin
#define VRY_PIN2  39  // Joystick 1 VRY pin

#define VRX_PIN1  14  // Joystick 2 VRX pin
#define VRY_PIN1  27  // Joystick 2 VRY pin

#define BUTTON_1 4 // Button 1 pin
#define BUTTON_2 5 // Button 2 pin (red)
#define BUTTON_3 21 // Button 3 pin (blue)

int j1xValue = 0; // Joystick 1 X axis
int j1yValue = 0; // Joystick 1 Y axis

int j2xValue = 0; // Joystick 2 X axis
int j2yValue = 0; // Joystick 2 Y axis

int button1State = 0; // Button 1 state
int button2State = 0; // Button 2 state
int button3State = 0; // Button 3 state

// Calibration variables
int j1xNeutral = 0;
int j1yNeutral = 0;
int j2xNeutral = 0;
int j2yNeutral = 0;

const int DEAD_ZONE = 100; // Define a dead zone threshold

void setup() {
  Serial.begin(115200);

  // Set up joystick pins
  pinMode(VRX_PIN1, INPUT); // Joystick 1 VRX as input
  pinMode(VRY_PIN1, INPUT); // Joystick 1 VRY as input
  pinMode(VRX_PIN2, INPUT); // Joystick 2 VRX as input
  pinMode(VRY_PIN2, INPUT); // Joystick 2 VRY as input

  // Set up button pins
  pinMode(BUTTON_1, INPUT_PULLUP); // Button 1 as input with pull-up
  pinMode(BUTTON_2, INPUT_PULLUP); // Button 2 as input with pull-up
  pinMode(BUTTON_3, INPUT_PULLUP); // Button 3 as input with pull-up

  // Calibrate joystick 1
  for (int i = 0; i < 100; i++) {
    j1xNeutral += analogRead(VRX_PIN1);
    j1yNeutral += analogRead(VRY_PIN1);
    delay(10);
  }
  j1xNeutral /= 100; // Average value
  j1yNeutral /= 100;

  // Calibrate joystick 2
  for (int i = 0; i < 100; i++) {
    j2xNeutral += analogRead(VRX_PIN2);
    j2yNeutral += analogRead(VRY_PIN2);
    delay(10);
  }
  j2xNeutral /= 100; // Average value
  j2yNeutral /= 100;
}

void loop() {
  // Read joystick 1 values
  j1xValue = analogRead(VRX_PIN1) - j1xNeutral;
  j1yValue = analogRead(VRY_PIN1) - j1yNeutral;

  // Apply dead zone for joystick 1
  if (abs(j1xValue) < DEAD_ZONE) j1xValue = 0;
  if (abs(j1yValue) < DEAD_ZONE) j1yValue = 0;

  // Read joystick 2 values
  j2xValue = analogRead(VRX_PIN2) - j2xNeutral;
  j2yValue = analogRead(VRY_PIN2) - j2yNeutral;

  // Apply dead zone for joystick 2
  if (abs(j2xValue) < DEAD_ZONE) j2xValue = 0;
  if (abs(j2yValue) < DEAD_ZONE) j2yValue = 0;

  // Read button states (0 when pressed, 1 when not pressed)
  button1State = 1 - digitalRead(BUTTON_1);
  button2State = 1 - digitalRead(BUTTON_2);
  button3State = 1 - digitalRead(BUTTON_3);

  // Combine all values into one string
  String output = String(j1xValue) + "," + String(j1yValue) + "," + 
                  String(j2xValue) + "," + String(j2yValue) + "," + 
                  String(button1State) + "," + String(button2State) + "," + 
                  String(button3State);
  
  // Send the concatenated string over serial
  Serial.println(output);

  delay(200); // Adjust for smoother communication if needed
}


