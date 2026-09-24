#include <Servo.h>

// ==========================
// L298N MOTOR PINS
// ==========================

#define IN1 5
#define IN2 6
#define IN3 7
#define IN4 8
#define ENA 3
#define ENB 10

// ==========================
// HC-SR04 PINS
// ==========================

#define CENTER_TRIG A0
#define CENTER_ECHO A1
#define LEFT_TRIG A2
#define LEFT_ECHO A3
#define RIGHT_TRIG 9
#define RIGHT_ECHO 11


void setup() {

  // Motor pins
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  // Ultrasonic sensor
  pinMode(CENTER_TRIG, OUTPUT);
  pinMode(CENTER_ECHO, INPUT);
  pinMode(LEFT_TRIG, OUTPUT);
  pinMode(LEFT_ECHO, INPUT);
  pinMode(RIGHT_TRIG, OUTPUT);
  pinMode(RIGHT_ECHO, INPUT);

  // Serial monitor
  Serial.begin(9600);

  // Make sure robot starts stopped
  stopRobot();

  delay(1000);
}


// ==========================
// MAIN LOOP
// ==========================

void loop() {

  float frontDistance = getCenterDistance();
  float leftDistance = getLeftDistance();
  float rightDistance = getRightDistance();


  Serial.print("Front: ");
  Serial.print(frontDistance);
  Serial.println(" cm");
  
  Serial.print("Left: ");
  Serial.print(leftDistance);
  Serial.println(" cm");
  
  Serial.print("Right: ");
  Serial.print(rightDistance);
  Serial.println(" cm");


  // NO OBSTACLE

  if (frontDistance > 20) {
     forward();
  } else {
    stopRobot();
    delay(100);
    avoidObstacle();
  }
  delay(50);
}


// GET DISTANCE

float getCenterDistance() {

  // Clear trigger
  digitalWrite(CENTER_TRIG, LOW);
  delayMicroseconds(2);

  // Send ultrasonic pulse
  digitalWrite(CENTER_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(CENTER_TRIG, LOW);

  // Measure echo
  long duration = pulseIn(CENTER_ECHO, HIGH, 30000);

  // If no echo was received
  if (duration == 0) {
    return 400;
  }

  // Calculate distance
  float distance = duration * 0.0343 / 2;

  return distance;
}


float getRightDistance() {

  // Clear trigger
  digitalWrite(RIGHT_TRIG, LOW);
  delayMicroseconds(2);

  // Send ultrasonic pulse
  digitalWrite(RIGHT_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(RIGHT_TRIG, LOW);

  // Measure echo
  long duration = pulseIn(RIGHT_ECHO, HIGH, 30000);

  // If no echo was received
  if (duration == 0) {
    return 400;
  }

  // Calculate distance
  float distance = duration * 0.0343 / 2;

  return distance;
}


float getLeftDistance() {

  // Clear trigger
  digitalWrite(LEFT_TRIG, LOW);
  delayMicroseconds(2);

  // Send ultrasonic pulse
  digitalWrite(LEFT_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(LEFT_TRIG, LOW);

  // Measure echo
  long duration = pulseIn(LEFT_ECHO, HIGH, 30000);

  // If no echo was received
  if (duration == 0) {
    return 400;
  }

  // Calculate distance
  float distance = duration * 0.0343 / 2;

  return distance;
}


// OBSTACLE AVOIDANCE

void avoidObstacle() {

  float frontDistance = getCenterDistance();
  float leftDistance = getLeftDistance();
  float rightDistance = getRightDistance();

  // If all directions are blocked, keep reversing
  if (frontDistance < 20 && leftDistance < 20 && rightDistance < 20) {

    Serial.println("All sides blocked - Reversing");

    reverseRobot();

    // Keep reversing until at least one direction is clear
    while (true) {

      frontDistance = getCenterDistance();
      leftDistance = getLeftDistance();
      rightDistance = getRightDistance();

      Serial.print("Reverse - Front: ");
      Serial.print(frontDistance);
      Serial.print(" cm | Left: ");
      Serial.print(leftDistance);
      Serial.print(" cm | Right: ");
      Serial.print(rightDistance);
      Serial.println(" cm");

      // Stop reversing as soon as ANY direction becomes clear
      if (frontDistance > 20 ||
          leftDistance > 20 ||
          rightDistance > 20) {

        stopRobot();
        delay(200);

        Serial.println("Clear direction found - Stopped reversing");

        break;
      }

      delay(50);
    }

    return;
  }

  
  // Choose direction based on side distances
  if (leftDistance > rightDistance) {
    Serial.println("Turning Left");
    turnLeft();
    delay(300);
  } else {
    Serial.println("Turning Rights");
    turnRight();
    delay(300);
  }
  stopRobot();
  delay(200);
}

// ==========================
// MOVE FORWARD
// ==========================

void forward() {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 255);

  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 255);
}


// ==========================
// TURN LEFT
// ==========================

void turnLeft() {

  Serial.println("Turning Left");
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, 0);


  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 255);
}


// ==========================
// TURN RIGHT
// ==========================

void turnRight() {

  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 225);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  analogWrite(ENB, 0);
}


// ==========================
// STOP
// ==========================

void stopRobot() {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 0);
}

void reverseRobot() {

  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA,225);

  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  analogWrite(ENB,225);
}