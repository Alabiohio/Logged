// L298N MOTOR PINS
// ==========================
#define IN1 8
#define IN2 7
#define IN3 6
#define IN4 5
#define ENA 3
#define ENB 10
// ==========================
// HC-SR04 PINS
// ==========================
#define CENTER_TRIG A0
#define CENTER_ECHO A1
#define LEFT_TRIG A2
#define LEFT_ECHO A3
#define RIGHT_TRIG A4
#define RIGHT_ECHO A5

// ==========================
// LED
// ==========================
#define LEFT_LED 4
#define CENTER_LED 11
#define RIGHT_LED 9

unsigned long previousBlinkTime = 0;
const long blinkInterval = 80; // Speed of blinking in ms
bool ledState = LOW;

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(CENTER_TRIG, OUTPUT);
  pinMode(CENTER_ECHO, INPUT);
  pinMode(LEFT_TRIG, OUTPUT);
  pinMode(LEFT_ECHO, INPUT);
  pinMode(RIGHT_TRIG, OUTPUT);
  pinMode(RIGHT_ECHO, INPUT);
  pinMode(LEFT_LED, OUTPUT);
  pinMode(CENTER_LED, OUTPUT);
  pinMode(RIGHT_LED, OUTPUT);
  Serial.begin(9600);
  stopRobot();
  delay(500);
}
// ==========================
// MAIN LOOP
// ==========================
void loop() {
  float frontDistance = getCenterDistance();
  float leftDistance = getLeftDistance();
  float rightDistance = getRightDistance();
  Serial.print("Front: "); Serial.print(frontDistance); Serial.println(" cm");
  Serial.print("Left: ");  Serial.print(leftDistance);  Serial.println(" cm");
  Serial.print("Right: "); Serial.print(rightDistance); Serial.println(" cm");
  if (frontDistance > 20) {
    forward();
  } else {
    stopRobot();
    delay(100);
    avoidObstacle();
  }
 
  delay(10);
}
// ==========================
// FAST DISTANCE FILTERING
// ==========================
float takeSingleReading(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 12000);
  if (duration == 0) {
    return 400.0;
  }
  return duration * 0.0343 / 2.0;
}
float readRobustDistance(int trigPin, int echoPin) {
  float r1 = takeSingleReading(trigPin, echoPin);
  delay(2);
  float r2 = takeSingleReading(trigPin, echoPin);
  return (r1 < r2) ? r1 : r2;
}
// ==========================
// SENSOR GETTERS
// ==========================
float getCenterDistance() {
  float dist = readRobustDistance(CENTER_TRIG, CENTER_ECHO);
  delay(10);
  return dist;
}
float getLeftDistance() {
  float dist = readRobustDistance(LEFT_TRIG, LEFT_ECHO);
  delay(10);
  return dist;
}
float getRightDistance() {
  float dist = readRobustDistance(RIGHT_TRIG, RIGHT_ECHO);
  delay(10);
  return dist;
}
// ==========================
// OBSTACLE AVOIDANCE
// ==========================
// ==========================
// OBSTACLE AVOIDANCE
// ==========================
void avoidObstacle() {
  float frontDistance = getCenterDistance();
  float leftDistance = getLeftDistance();
  float rightDistance = getRightDistance();

  // CRITICAL ESCAPE: All sides trapped
  if (frontDistance < 20 && leftDistance < 20 && rightDistance < 20) {
    Serial.println("All sides blocked - Reversing...");
    reverseRobot();

    // Reverse until at least one side opens up
    while (true) {
      updateReverseBlink();
      
      leftDistance = getLeftDistance();
      rightDistance = getRightDistance();
      if (leftDistance > 25 || rightDistance > 25) {
        stopRobot();
        break;
      }
      delay(20);
    }

    // Choose the side with more free space
    if (leftDistance > rightDistance) {
      Serial.println("Turning LEFT until front is clear or trapped again...");
      turnLeft();

      while (true) {
        frontDistance = getCenterDistance();
        leftDistance = getLeftDistance();
        rightDistance = getRightDistance();

        // Stop if front becomes clear
        if (frontDistance > 25) {
          break;
        }

        // Stop if all sides get blocked again while turning
        if (frontDistance < 20 && leftDistance < 20 && rightDistance < 20) {
          Serial.println("Re-trapped while turning left!");
          stopRobot();
          return; // Exit function so main loop re-triggers avoidObstacle() -> reverseRobot()
        }

        delay(10);
      }

    } else {
      Serial.println("Turning RIGHT until front is clear or trapped again...");
      turnRight();

      while (true) {
        frontDistance = getCenterDistance();
        leftDistance = getLeftDistance();
        rightDistance = getRightDistance();

        // Stop if front becomes clear
        if (frontDistance > 25) {
          break;
        }

        // Stop if all sides get blocked again while turning
        if (frontDistance < 20 && leftDistance < 20 && rightDistance < 20) {
          Serial.println("Re-trapped while turning right!");
          stopRobot();
          return; // Exit function so main loop re-triggers avoidObstacle() -> reverseRobot()
        }

        delay(10);
      }
    }
    
    stopRobot();
    return;
  }

  // STANDARD AVOIDANCE
  // ==========================
  // TURN LEFT
  // ==========================
  if (leftDistance > rightDistance) {
    Serial.println("Turning LEFT...");
    turnLeft();

    while (true) {
      frontDistance = getCenterDistance();
      leftDistance = getLeftDistance();
      rightDistance = getRightDistance();

      // Front is clear
      if (frontDistance > 25) {
        break;
      }

      // Left side became blocked
      if (leftDistance < 20) {
        Serial.println("LEFT BLOCKED - STOPPING TURN");
        stopRobot();
        delay(100);

        if (rightDistance < 20) {
          reverseRobot();
          delay(500);
          stopRobot();
        }

        break;
      }

      delay(10);
    }
  }

  // ==========================
  // TURN RIGHT
  // ==========================
  else {
    Serial.println("Turning RIGHT...");
    turnRight();

    while (true) {
      frontDistance = getCenterDistance();
      leftDistance = getLeftDistance();
      rightDistance = getRightDistance();

      // Front is clear
      if (frontDistance > 25) {
        break;
      }

      // Right side became blocked
      if (rightDistance < 20) {
        Serial.println("RIGHT BLOCKED - STOPPING TURN");
        stopRobot();
        delay(100);

        if (leftDistance < 20) {
          reverseRobot();
          delay(500);
          stopRobot();
        }

        break;
      }

      delay(10);
    }
  }
  
  stopRobot();
}
// ==========================
// MOTOR CONTROL
// ==========================
void forward() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 255);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 255);
  
  digitalWrite(LEFT_LED, LOW);
  digitalWrite(CENTER_LED, HIGH);
  digitalWrite(RIGHT_LED, LOW);
}
void turnLeft() {
  Serial.println("Turning Left");
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
  
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 255);
  
  digitalWrite(LEFT_LED, HIGH);
  digitalWrite(CENTER_LED, LOW);
  digitalWrite(RIGHT_LED, LOW);
}
void turnRight() {
  Serial.println("Turning Right");
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 255);
  
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 0);
  
  digitalWrite(LEFT_LED, LOW);
  digitalWrite(CENTER_LED, LOW);
  digitalWrite(RIGHT_LED, HIGH);
}
void stopRobot() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 0);
  
  digitalWrite(LEFT_LED, LOW);
  digitalWrite(CENTER_LED, LOW);
  digitalWrite(RIGHT_LED, LOW);
}

void reverseRobot() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, 225);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  analogWrite(ENB, 225);
  
  updateReverseBlink();
}

void updateReverseBlink() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousBlinkTime >= blinkInterval) {
    previousBlinkTime = currentMillis;
    ledState = !ledState;
    
    digitalWrite(LEFT_LED, ledState);
    digitalWrite(CENTER_LED, ledState);
    digitalWrite(RIGHT_LED, ledState);
  }
}