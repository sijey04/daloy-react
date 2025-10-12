/*
 * Traffic Light Control System with Serial Communication
 * Can be controlled from computer/React app via Serial commands
 * 
 * Commands:
 * - TEST: Run LED test
 * - AUTO: Start automatic traffic sequence
 * - STOP: Stop and turn all red
 * - NS_GREEN: Set North-South to green
 * - NS_YELLOW: Set North-South to yellow
 * - NS_RED: Set North-South to red
 * - EW_GREEN: Set East-West to green
 * - EW_YELLOW: Set East-West to yellow
 * - EW_RED: Set East-West to red
 * - R3_GREEN: Set Road 3 to green
 * - R3_YELLOW: Set Road 3 to yellow
 * - R3_RED: Set Road 3 to red
 * - R4_GREEN: Set Road 4 to green
 * - R4_YELLOW: Set Road 4 to yellow
 * - R4_RED: Set Road 4 to red
 * - ALL_RED: Set all to red
 * - STATUS: Get current status
 */

// Pin definitions for 4-road intersection
const int NS_RED = 2;
const int NS_YELLOW = 3;
const int NS_GREEN = 4;

const int EW_RED = 5;
const int EW_YELLOW = 6;
const int EW_GREEN = 7;

const int ROAD3_RED = 8;
const int ROAD3_YELLOW = 9;
const int ROAD3_GREEN = 10;

const int ROAD4_RED = 11;
const int ROAD4_YELLOW = 12;
const int ROAD4_GREEN = 13;

// Mode control
enum Mode {
  MANUAL,
  AUTO,
  TEST,
  STOPPED
};

Mode currentMode = STOPPED;
char inputBuffer[32] = "";  // Fixed size buffer instead of String
byte bufferIndex = 0;
boolean stringComplete = false;
unsigned long lastAutoUpdate = 0;
int autoPhase = 0;

// Configurable timing (in milliseconds)
unsigned long greenDuration = 5000;
unsigned long yellowDuration = 2000;
unsigned long redDuration = 5000;

// Configurable sequence (0=NS, 1=EW, 2=R3, 3=R4)
byte sequence[4] = {0, 1, 2, 3}; // Default: NS, EW, R3, R4

void setup() {
  Serial.begin(9600);
  
  // Set all pins as OUTPUT
  pinMode(NS_RED, OUTPUT);
  pinMode(NS_YELLOW, OUTPUT);
  pinMode(NS_GREEN, OUTPUT);
  
  pinMode(EW_RED, OUTPUT);
  pinMode(EW_YELLOW, OUTPUT);
  pinMode(EW_GREEN, OUTPUT);
  
  pinMode(ROAD3_RED, OUTPUT);
  pinMode(ROAD3_YELLOW, OUTPUT);
  pinMode(ROAD3_GREEN, OUTPUT);
  
  pinMode(ROAD4_RED, OUTPUT);
  pinMode(ROAD4_YELLOW, OUTPUT);
  pinMode(ROAD4_GREEN, OUTPUT);
  
  turnOffAllLights();
  allRed();
  
  Serial.println("Traffic Light Control System Ready");
  Serial.println("Type 'HELP' for commands");
  printStatus();
}

void loop() {
  // Check for serial commands
  if (stringComplete) {
    processCommand(inputBuffer);
    bufferIndex = 0;
    inputBuffer[0] = '\0';
    stringComplete = false;
  }
  
  // Handle automatic mode
  if (currentMode == AUTO) {
    handleAutoMode();
  }
}

// Serial event handler
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\n' || inChar == '\r') {
      inputBuffer[bufferIndex] = '\0';
      stringComplete = true;
    } else if (bufferIndex < 31) {
      inputBuffer[bufferIndex++] = inChar;
    }
  }
}

void processCommand(char* command) {
  // Convert to uppercase
  for (int i = 0; command[i]; i++) {
    if (command[i] >= 'a' && command[i] <= 'z') {
      command[i] -= 32;
    }
  }
  
  Serial.print(F("Command: "));
  Serial.println(command);
  
  if (strcmp(command, "HELP") == 0) {
    printHelp();
  }
  else if (strcmp(command, "TEST") == 0) {
    currentMode = TEST;
    testAllLEDs();
    currentMode = STOPPED;
    allRed();
  }
  else if (strcmp(command, "AUTO") == 0) {
    currentMode = AUTO;
    autoPhase = 0;
    lastAutoUpdate = millis();
    Serial.println(F("AUTO mode activated"));
  }
  else if (strcmp(command, "STOP") == 0 || strcmp(command, "ALL_RED") == 0) {
    currentMode = STOPPED;
    allRed();
    Serial.println(F("STOPPED - All lights RED"));
  }
  else if (strcmp(command, "STATUS") == 0) {
    printStatus();
  }
  // North-South controls
  else if (strcmp(command, "NS_GREEN") == 0) {
    currentMode = MANUAL;
    setLight(0, 2);
  }
  else if (strcmp(command, "NS_YELLOW") == 0) {
    currentMode = MANUAL;
    setLight(0, 1);
  }
  else if (strcmp(command, "NS_RED") == 0) {
    currentMode = MANUAL;
    setLight(0, 0);
  }
  // East-West controls
  else if (strcmp(command, "EW_GREEN") == 0) {
    currentMode = MANUAL;
    setLight(1, 2);
  }
  else if (strcmp(command, "EW_YELLOW") == 0) {
    currentMode = MANUAL;
    setLight(1, 1);
  }
  else if (strcmp(command, "EW_RED") == 0) {
    currentMode = MANUAL;
    setLight(1, 0);
  }
  // Road 3 controls
  else if (strcmp(command, "R3_GREEN") == 0) {
    currentMode = MANUAL;
    setLight(2, 2);
  }
  else if (strcmp(command, "R3_YELLOW") == 0) {
    currentMode = MANUAL;
    setLight(2, 1);
  }
  else if (strcmp(command, "R3_RED") == 0) {
    currentMode = MANUAL;
    setLight(2, 0);
  }
  // Road 4 controls
  else if (strcmp(command, "R4_GREEN") == 0) {
    currentMode = MANUAL;
    setLight(3, 2);
  }
  else if (strcmp(command, "R4_YELLOW") == 0) {
    currentMode = MANUAL;
    setLight(3, 1);
  }
  else if (strcmp(command, "R4_RED") == 0) {
    currentMode = MANUAL;
    setLight(3, 0);
  }
  // Timing configuration commands
  else if (strncmp(command, "SET_GREEN:", 10) == 0) {
    int duration = atoi(command + 10);
    if (duration >= 15 && duration <= 60) {
      greenDuration = duration * 1000UL;
      Serial.print(F("Green: "));
      Serial.print(duration);
      Serial.println(F("s"));
    } else {
      Serial.println(F("Error: Green 15-60s"));
    }
  }
  else if (strncmp(command, "SET_YELLOW:", 11) == 0) {
    int duration = atoi(command + 11);
    if (duration >= 3 && duration <= 8) {
      yellowDuration = duration * 1000UL;
      Serial.print(F("Yellow: "));
      Serial.print(duration);
      Serial.println(F("s"));
    } else {
      Serial.println(F("Error: Yellow 3-8s"));
    }
  }
  else if (strncmp(command, "SET_RED:", 8) == 0) {
    int duration = atoi(command + 8);
    if (duration >= 30 && duration <= 80) {
      redDuration = duration * 1000UL;
      Serial.print(F("Red: "));
      Serial.print(duration);
      Serial.println(F("s"));
    } else {
      Serial.println(F("Error: Red 30-80s"));
    }
  }
  // Sequence configuration command: SET_SEQUENCE:0,1,2,3
  else if (strncmp(command, "SET_SEQUENCE:", 13) == 0) {
    char* seqStr = command + 13;
    byte idx = 0;
    char* token = strtok(seqStr, ",");
    
    while (token != NULL && idx < 4) {
      int roadNum = atoi(token);
      if (roadNum >= 0 && roadNum <= 3) {
        sequence[idx++] = roadNum;
      } else {
        Serial.println(F("Error: Road 0-3"));
        return;
      }
      token = strtok(NULL, ",");
    }
    
    if (idx == 4) {
      Serial.print(F("Seq: "));
      for (byte i = 0; i < 4; i++) {
        Serial.print(sequence[i]);
        if (i < 3) Serial.print(',');
      }
      Serial.println();
    } else {
      Serial.println(F("Error: Need 4 roads"));
    }
  }
  else {
    Serial.println(F("Unknown cmd"));
  }
}

// roadNum: 0=NS, 1=EW, 2=R3, 3=R4
// colorNum: 0=RED, 1=YELLOW, 2=GREEN
void setLight(byte roadNum, byte colorNum) {
  // Pin arrays for each road [RED, YELLOW, GREEN]
  const byte pins[4][3] = {
    {NS_RED, NS_YELLOW, NS_GREEN},
    {EW_RED, EW_YELLOW, EW_GREEN},
    {ROAD3_RED, ROAD3_YELLOW, ROAD3_GREEN},
    {ROAD4_RED, ROAD4_YELLOW, ROAD4_GREEN}
  };
  
  // Safety: set all other roads to RED when any light turns GREEN
  if (colorNum == 2) {
    for (byte i = 0; i < 4; i++) {
      if (i != roadNum) {
        digitalWrite(pins[i][0], HIGH);  // RED on
        digitalWrite(pins[i][1], LOW);   // YELLOW off
        digitalWrite(pins[i][2], LOW);   // GREEN off
      }
    }
  }
  
  // Set requested road color
  if (roadNum < 4 && colorNum < 3) {
    digitalWrite(pins[roadNum][0], colorNum == 0 ? HIGH : LOW);
    digitalWrite(pins[roadNum][1], colorNum == 1 ? HIGH : LOW);
    digitalWrite(pins[roadNum][2], colorNum == 2 ? HIGH : LOW);
  }
}

void handleAutoMode() {
  unsigned long currentTime = millis();
  unsigned long elapsed = currentTime - lastAutoUpdate;
  
  byte roadIndex = autoPhase / 2;
  byte phase = autoPhase % 2;
  
  if (roadIndex >= 4) {
    autoPhase = 0;
    lastAutoUpdate = currentTime;
    return;
  }
  
  byte currentRoad = sequence[roadIndex];
  
  if (phase == 0) {
    // GREEN phase
    if (elapsed == 0) {
      setLight(currentRoad, 2); // 2=GREEN
    }
    if (elapsed > greenDuration) {
      autoPhase++;
      lastAutoUpdate = currentTime;
    }
  } else {
    // YELLOW phase
    if (elapsed == 0) {
      setLight(currentRoad, 1); // 1=YELLOW
    }
    if (elapsed > yellowDuration) {
      autoPhase++;
      if (autoPhase >= 8) autoPhase = 0;
      lastAutoUpdate = currentTime;
    }
  }
}

void testAllLEDs() {
  Serial.println(F("Testing LEDs..."));
  turnOffAllLights();
  
  const byte pins[] = {NS_RED, NS_YELLOW, NS_GREEN, EW_RED, EW_YELLOW, EW_GREEN, 
                       ROAD3_RED, ROAD3_YELLOW, ROAD3_GREEN, ROAD4_RED, ROAD4_YELLOW, ROAD4_GREEN};
  
  for (byte i = 0; i < 12; i++) {
    digitalWrite(pins[i], HIGH);
    delay(300);
    digitalWrite(pins[i], LOW);
    delay(100);
  }
  
  Serial.println(F("Test done"));
}

void allRed() {
  turnOffAllLights();
  digitalWrite(NS_RED, HIGH);
  digitalWrite(EW_RED, HIGH);
  digitalWrite(ROAD3_RED, HIGH);
  digitalWrite(ROAD4_RED, HIGH);
}

void turnOffAllLights() {
  digitalWrite(NS_RED, LOW);
  digitalWrite(NS_YELLOW, LOW);
  digitalWrite(NS_GREEN, LOW);
  
  digitalWrite(EW_RED, LOW);
  digitalWrite(EW_YELLOW, LOW);
  digitalWrite(EW_GREEN, LOW);
  
  digitalWrite(ROAD3_RED, LOW);
  digitalWrite(ROAD3_YELLOW, LOW);
  digitalWrite(ROAD3_GREEN, LOW);
  
  digitalWrite(ROAD4_RED, LOW);
  digitalWrite(ROAD4_YELLOW, LOW);
  digitalWrite(ROAD4_GREEN, LOW);
}

void printStatus() {
  Serial.println(F("\n=== STATUS ==="));
  Serial.print(F("Mode: "));
  switch(currentMode) {
    case MANUAL: Serial.println(F("MANUAL")); break;
    case AUTO: Serial.println(F("AUTO")); break;
    case TEST: Serial.println(F("TEST")); break;
    case STOPPED: Serial.println(F("STOP")); break;
  }
  
  Serial.print(F("NS: "));
  printLightState(NS_RED, NS_YELLOW, NS_GREEN);
  Serial.print(F(" EW: "));
  printLightState(EW_RED, EW_YELLOW, EW_GREEN);
  Serial.print(F(" R3: "));
  printLightState(ROAD3_RED, ROAD3_YELLOW, ROAD3_GREEN);
  Serial.print(F(" R4: "));
  printLightState(ROAD4_RED, ROAD4_YELLOW, ROAD4_GREEN);
  Serial.println(F("\n============="));
}

void printLightState(byte redPin, byte yellowPin, byte greenPin) {
  if (digitalRead(redPin)) Serial.print('R');
  else if (digitalRead(yellowPin)) Serial.print('Y');
  else if (digitalRead(greenPin)) Serial.print('G');
  else Serial.print('-');
}

void printHelp() {
  Serial.println(F("\n=== COMMANDS ==="));
  Serial.println(F("TEST/AUTO/STOP/STATUS"));
  Serial.println(F("SET_GREEN:30 (15-60s)"));
  Serial.println(F("SET_YELLOW:5 (3-8s)"));
  Serial.println(F("SET_SEQUENCE:0,1,2,3"));
  Serial.println(F("Manual: NS_RED/EW_GREEN/R3_YELLOW/R4_RED etc"));
  Serial.println(F("================\n"));
}
