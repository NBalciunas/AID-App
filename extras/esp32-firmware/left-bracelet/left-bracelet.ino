#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SERVICE_UUID        "12345678-1234-5678-1234-56789abcdef0"
#define CHARACTERISTIC_UUID "abcdef01-1234-5678-1234-56789abcdef0"

const int VIB_PIN = LED_BUILTIN;
const unsigned long LED_ON_MS = 1000;

unsigned long ledOffAt = 0;

class MyCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pChar) override {
    String rx = pChar->getValue();

    Serial.print("Raw length: ");
    Serial.println(rx.length());

    Serial.print("Received: ");
    Serial.println(rx);

    if (rx == "L") {
      digitalWrite(VIB_PIN, HIGH);
      ledOffAt = millis() + LED_ON_MS;
    }
  }
};

class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) override {
    Serial.println("Client connected");
  }

  void onDisconnect(BLEServer *pServer) override {
    Serial.println("Client disconnected, restarting advertising");
    BLEDevice::startAdvertising();
  }
};

void setup() {
  Serial.begin(115200);

  pinMode(VIB_PIN, OUTPUT);
  digitalWrite(VIB_PIN, LOW);

  BLEDevice::init("ESP32-LEFT");

  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new MyServerCallbacks());

  BLEService *service = server->createService(SERVICE_UUID);

  BLECharacteristic *characteristic = service->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_READ  |
    BLECharacteristic::PROPERTY_NOTIFY
  );

  characteristic->setCallbacks(new MyCallback());
  service->start();

  BLEAdvertising *advertising = BLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("BLE Ready. Waiting for app...");
}

void loop() {
  if (ledOffAt != 0 && millis() >= ledOffAt) {
    digitalWrite(VIB_PIN, LOW);
    ledOffAt = 0;
  }

  delay(500);
}
