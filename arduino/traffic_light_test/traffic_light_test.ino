/*
 * Simple LED Test - One at a Time
 * This will test each LED individually so you can see which ones don't work
 */

void setup() {
  Serial.begin(9600);
  
  // Set all pins as OUTPUT
  for (int pin = 2; pin <= 13; pin++) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
  
  Serial.println("LED Test Starting...");
  Serial.println("Watch which LEDs light up and note which pins work");
}

void loop() {
  // Test each pin one by one
  for (int pin = 2; pin <= 13; pin++) {
    Serial.print("Testing Pin ");
    Serial.print(pin);
    Serial.print(" - ");
    
    // Determine which LED this should be
    if (pin == 2) Serial.print("North-South RED");
    else if (pin == 3) Serial.print("North-South YELLOW");
    else if (pin == 4) Serial.print("North-South GREEN");
    else if (pin == 5) Serial.print("East-West RED");
    else if (pin == 6) Serial.print("East-West YELLOW");
    else if (pin == 7) Serial.print("East-West GREEN");
    else if (pin == 8) Serial.print("Road 3 RED");
    else if (pin == 9) Serial.print("Road 3 YELLOW");
    else if (pin == 10) Serial.print("Road 3 GREEN");
    else if (pin == 11) Serial.print("Road 4 RED");
    else if (pin == 12) Serial.print("Road 4 YELLOW");
    else if (pin == 13) Serial.print("Road 4 GREEN");
    
    Serial.println();
    
    // Turn on this LED
    digitalWrite(pin, HIGH);
    delay(1000);  // Keep on for 1 second
    
    // Turn off this LED
    digitalWrite(pin, LOW);
    delay(500);   // Wait 0.5 seconds before next LED
  }
  
  Serial.println("\n=== Test Complete! ===");
  Serial.println("All working LEDs should have lit up.");
  Serial.println("Note which pins did NOT light up.\n");
  delay(3000);
}
