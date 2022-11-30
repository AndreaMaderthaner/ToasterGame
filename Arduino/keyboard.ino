int pushButton = 2;
bool isButtonTriggered = false;
// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  // make the pushbutton's pin an input:
  pinMode(pushButton, INPUT);
}

// the loop routine runs over and over again forever:
void loop() {
  // read the input pin:
  int buttonState = digitalRead(pushButton);
  // print out the state of the button:
  if (buttonState == 0 && isButtonTriggered == true){
    isButtonTriggered = false;
    Serial.write("1");
  }
  if (buttonState == 1 && isButtonTriggered == false){
    isButtonTriggered = true;
    // Serial.println(isButtonTriggered);
  }
}
