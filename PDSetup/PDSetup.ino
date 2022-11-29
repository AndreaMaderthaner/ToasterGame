int buttonA = 0;
int buttonB = 0;
float playback = 1;

void setup() {
  Serial.begin(9600);

}

void loop() {
  buttonA = analogRead(0);
  buttonB = analogRead(1);
  //calculation of playback
  Serial.println(playback);
}
