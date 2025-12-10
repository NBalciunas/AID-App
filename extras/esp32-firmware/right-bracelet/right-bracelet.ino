#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define SERVICE_UUID        "12345678-1234-5678-1234-56789abcdef0"
#define CHARACTERISTIC_UUID "abcdef01-1234-5678-1234-56789abcdef0"

class MyCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pChar) override {
    std::string rx = std::string(pChar->getValue().c_str());

    Serial.print("Raw length: ");
    Serial.println(rx.length());

    Serial.print("Received: ");
    for (char c : rx) Serial.print(c);
    Serial.println();
  }
};

void setup() {
  Serial.begin(115200);

  BLEDevice::init("ESP32-BLE");
  BLEServer *server = BLEDevice::createServer();
  BLEService *service = server->createService(SERVICE_UUID);

  BLECharacteristic *characteristic = service->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_READ |
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
  delay(500);
}
