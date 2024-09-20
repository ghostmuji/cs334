from gpiozero import Button
from time import sleep

# Define the button pins
button = Button(2)       # Main button
joystickx = Button(17)    # X-axis button for left/right
joysticky = Button(22)    # Y-axis button for up/down
joystickpress = Button(26)

# Initialize a state variable
state = 0

# Function to handle when the joystick is moved left (X-axis pressed)
def joystick_moved_left():
    global state
    state = 1  # Enter state 1
    print("Joystick moved LEFT, entered State 1")

def joystick_moved_up():
    global state
    state = 2
    print("Joystick moved UP, entered State 2")

def joystick_pressed():
    global state
    state = 0
    print("Joystick pressed, returned to State 0")

# Function to handle button press only when in state 1
def button_pressed():
    global state
    if state == 1:
        print("Button pressed in State 1!")
    if state == 2:
        print("Button pressed in State 2 :-)")
    if state == 0:
        print("Button pressed in State 0 ^-^")

# Wait for the X-axis button (joystick left movement) to be pressed
joystickx.when_pressed = joystick_moved_left
joysticky.when_pressed = joystick_moved_up
button.when_pressed = button_pressed
joystickpress.when_pressed = joystick_pressed

# Main loop 
while True:
    sleep(0.1)
