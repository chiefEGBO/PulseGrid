#include <Arduino.h>
#include <Wire.h>
#include <math.h>
#include <WiFi.h>
#include <WebServer.h>
#include "MAX30105.h"

MAX30105 sensor;
WebServer server(80);

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const uint8_t I2C_SDA = 21;
const uint8_t I2C_SCL = 22;

const long FINGER_THRESHOLD = 50000;

const unsigned long SAMPLE_INTERVAL = 20;

const float MIN_BPM = 40.0f;
const float MAX_BPM = 150.0f;

const unsigned long MIN_BEAT_INTERVAL = 450;
const unsigned long MAX_BEAT_INTERVAL = 1500;

const byte RATE_SIZE = 8;
float bpmValues[RATE_SIZE];
byte bpmIndex = 0;
byte validBpmCount = 0;

unsigned long lastSampleTime = 0;
unsigned long lastBeatTime = 0;

float currentBPM = 0;
float averageBPM = 0;

bool fingerDetected = false;
bool previousFingerDetected = false;

float dcAverage = 0;
float filteredSignal = 0;
float previousFilteredSignal = 0;
float previousPreviousFilteredSignal = 0;

float pulseAmplitude = 0;
float threshold = 0;

unsigned long fingerStartTime = 0;
const unsigned long STABILIZATION_TIME = 3000;

bool beatLockout = false;
unsigned long beatLockoutStart = 0;
const unsigned long BEAT_LOCKOUT_TIME = 450;

const unsigned long SPO2_MEASUREMENT_TIME = 20000;

unsigned long spo2StartTime = 0;

float irMean = 0;
float redMean = 0;

float irSquareSum = 0;
float redSquareSum = 0;

unsigned long spo2SampleCount = 0;

float currentSpO2 = 0;
float averageSpO2 = 0;

byte validSpO2Count = 0;

bool spo2Started = false;
bool spo2Complete = false;

bool measurementReady = false;

unsigned long measurementStartTime = 0;


void resetMeasurement()
{
    currentBPM = 0;
    averageBPM = 0;

    bpmIndex = 0;
    validBpmCount = 0;

    for (byte i = 0; i < RATE_SIZE; i++)
    {
        bpmValues[i] = 0;
    }

    dcAverage = 0;

    filteredSignal = 0;
    previousFilteredSignal = 0;
    previousPreviousFilteredSignal = 0;

    pulseAmplitude = 0;
    threshold = 0;

    lastBeatTime = 0;

    beatLockout = false;
    beatLockoutStart = 0;

    irMean = 0;
    redMean = 0;

    irSquareSum = 0;
    redSquareSum = 0;

    spo2SampleCount = 0;

    currentSpO2 = 0;
    averageSpO2 = 0;

    validSpO2Count = 0;

    spo2Started = false;
    spo2Complete = false;

    measurementReady = false;

    measurementStartTime = 0;
}


void addBPM(float bpm)
{
    if (bpm < MIN_BPM || bpm > MAX_BPM)
    {
        return;
    }

    bpmValues[bpmIndex] = bpm;
    bpmIndex = (bpmIndex + 1) % RATE_SIZE;

    if (validBpmCount < RATE_SIZE)
    {
        validBpmCount++;
    }

    float total = 0;

    for (byte i = 0; i < validBpmCount; i++)
    {
        total += bpmValues[i];
    }

    averageBPM = total / validBpmCount;
}


void addSpO2(float spo2)
{
    if (spo2 < 90.0f || spo2 > 100.0f)
    {
        return;
    }

    if (validSpO2Count == 0)
    {
        averageSpO2 = spo2;
    }
    else
    {
        averageSpO2 =
            ((averageSpO2 * validSpO2Count) + spo2) /
            (validSpO2Count + 1);
    }

    validSpO2Count++;
}


bool calculateSpO2()
{
    if (spo2SampleCount < 300)
    {
        Serial.print("SPO2 DEBUG | Samples: ");
        Serial.println(spo2SampleCount);

        return false;
    }

    Serial.println();
    Serial.println("----- SPO2 DEBUG -----");

    Serial.print("Samples: ");
    Serial.println(spo2SampleCount);

    Serial.print("IR Mean: ");
    Serial.println(irMean, 2);

    Serial.print("RED Mean: ");
    Serial.println(redMean, 2);

    if (irMean <= 0 || redMean <= 0)
    {
        Serial.println("REJECT: Invalid DC value.");
        Serial.println("---------------------");
        return false;
    }

    float irVariance =
        irSquareSum / spo2SampleCount;

    float redVariance =
        redSquareSum / spo2SampleCount;

    Serial.print("IR Variance: ");
    Serial.println(irVariance, 4);

    Serial.print("RED Variance: ");
    Serial.println(redVariance, 4);

    if (irVariance <= 0 || redVariance <= 0)
    {
        Serial.println("REJECT: Invalid AC variance.");
        Serial.println("---------------------");
        return false;
    }

    float irAC =
        sqrtf(irVariance);

    float redAC =
        sqrtf(redVariance);

    Serial.print("IR AC: ");
    Serial.println(irAC, 4);

    Serial.print("RED AC: ");
    Serial.println(redAC, 4);

    float irACRatio =
        irAC / irMean;

    float redACRatio =
        redAC / redMean;

    Serial.print("IR AC/DC: ");
    Serial.println(irACRatio, 6);

    Serial.print("RED AC/DC: ");
    Serial.println(redACRatio, 6);

    if (irACRatio <= 0 ||
        redACRatio <= 0)
    {
        Serial.println("REJECT: Invalid AC/DC ratio.");
        Serial.println("---------------------");
        return false;
    }

    float ratio =
        redACRatio / irACRatio;

    Serial.print("Ratio R: ");
    Serial.println(ratio, 6);

    if (ratio <= 0 || ratio > 3.0f)
    {
        Serial.println("REJECT: Ratio outside usable range.");
        Serial.println("---------------------");
        return false;
    }

    float spo2 =
        110.0f -
        (25.0f * ratio);

    Serial.print("Calculated SpO2: ");
    Serial.println(spo2, 2);

    if (spo2 < 70.0f || spo2 > 100.0f)
    {
        Serial.println("REJECT: Calculated SpO2 outside range.");
        Serial.println("---------------------");
        return false;
    }

    currentSpO2 = spo2;

    addSpO2(currentSpO2);

    Serial.println("SPO2 ACCEPTED.");
    Serial.println("---------------------");

    return true;
}


void handleMeasurement()
{
    unsigned long now = millis();

    unsigned long elapsed = 0;

    if (fingerDetected && measurementStartTime > 0)
    {
        elapsed = now - measurementStartTime;
    }

    int stabilizationProgress = 0;

    if (fingerDetected)
    {
        if (elapsed >= 23000)
        {
            stabilizationProgress = 100;
        }
        else
        {
            stabilizationProgress =
                (int)((elapsed * 100UL) / 23000UL);
        }
    }

    String json = "{";

    json += "\"fingerDetected\":";
    json += fingerDetected ? "true" : "false";

    json += ",\"bpm\":";
    json += String(currentBPM, 1);

    json += ",\"averageBpm\":";
    json += String(averageBPM, 1);

    json += ",\"spo2\":";
    json += String(currentSpO2, 1);

    json += ",\"averageSpo2\":";
    json += String(averageSpO2, 1);

    json += ",\"bpmReady\":";
    json += validBpmCount >= 2 ? "true" : "false";

    json += ",\"spo2Ready\":";
    json += spo2Complete ? "true" : "false";

    json += ",\"measurementReady\":";
    json += measurementReady ? "true" : "false";

    json += ",\"stabilizationProgress\":";
    json += String(stabilizationProgress);

    json += ",\"elapsed\":";
    json += String(elapsed);

    json += ",\"device\":\"ESP32\"";

    json += "}";

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");

    server.send(200, "application/json", json);
}


void handleOptions()
{
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");

    server.send(204);
}


void setup()
{
    Serial.begin(115200);
    delay(1000);

    Serial.println();
    Serial.println("=================================");
    Serial.println("      MAX30102 HEART RATE TEST");
    Serial.println("=================================");
    Serial.println();

    Wire.begin(I2C_SDA, I2C_SCL);

    Serial.println("Starting I2C...");

    if (!sensor.begin(Wire, I2C_SPEED_FAST))
    {
        Serial.println("ERROR: MAX30102 not found.");
        Serial.println();
        Serial.println("Check:");
        Serial.println("1. VIN/VCC");
        Serial.println("2. GND");
        Serial.println("3. SDA");
        Serial.println("4. SCL");
        Serial.println();

        while (true)
        {
            delay(1000);
        }
    }

    Serial.println("MAX30102 detected.");

    sensor.setup();

    sensor.setPulseAmplitudeRed(0x3F);
    sensor.setPulseAmplitudeIR(0x3F);
    sensor.setPulseAmplitudeGreen(0);

    Serial.println("Sensor configured.");
    Serial.println();

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting to Wi-Fi");

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("Wi-Fi connected.");

    Serial.print("ESP32 IP address: ");
    Serial.println(WiFi.localIP());

    server.on("/measurement", HTTP_GET, handleMeasurement);
    server.on("/measurement", HTTP_OPTIONS, handleOptions);

    server.begin();

    Serial.println("Measurement server started.");
    Serial.println();
    Serial.println("Place your finger gently on the sensor.");
    Serial.println("Keep your finger still.");
    Serial.println();
}


void loop()
{
    server.handleClient();

    unsigned long now = millis();

    if (now - lastSampleTime < SAMPLE_INTERVAL)
    {
        return;
    }

    lastSampleTime = now;

    long irValue = sensor.getIR();
    long redValue = sensor.getRed();

    fingerDetected =
        irValue > FINGER_THRESHOLD;


    if (!fingerDetected)
    {
        if (previousFingerDetected)
        {
            Serial.println();
            Serial.println("Finger removed.");
            Serial.println("Place your finger again when ready.");
            Serial.println();

            resetMeasurement();
        }

        previousFingerDetected = false;

        return;
    }


    if (!previousFingerDetected)
    {
        Serial.println();
        Serial.println("FINGER DETECTED");
        Serial.println("Collecting heart-rate signal...");
        Serial.println();

        resetMeasurement();

        fingerStartTime = now;
        measurementStartTime = now;

        previousFingerDetected = true;

        return;
    }


    if (dcAverage == 0)
    {
        dcAverage = irValue;
    }
    else
    {
        dcAverage =
            (dcAverage * 0.98f) +
            (irValue * 0.02f);
    }

    float acSignal =
        irValue - dcAverage;

    filteredSignal =
        (filteredSignal * 0.85f) +
        (acSignal * 0.15f);


    if (now - fingerStartTime >= STABILIZATION_TIME)
    {
        if (!spo2Started)
        {
            spo2Started = true;
            spo2StartTime = now;

            irMean = irValue;
            redMean = redValue;

            irSquareSum = 0;
            redSquareSum = 0;

            spo2SampleCount = 0;
        }


        float absoluteSignal =
            fabsf(filteredSignal);

        if (pulseAmplitude == 0)
        {
            pulseAmplitude =
                absoluteSignal;
        }
        else
        {
            pulseAmplitude =
                (pulseAmplitude * 0.98f) +
                (absoluteSignal * 0.02f);
        }

        threshold =
            pulseAmplitude * 0.55f;

        if (threshold < 100.0f)
        {
            threshold = 100.0f;
        }

        if (beatLockout &&
            now - beatLockoutStart >= BEAT_LOCKOUT_TIME)
        {
            beatLockout = false;
        }

        bool localMaximum =
            previousFilteredSignal >
                previousPreviousFilteredSignal &&
            previousFilteredSignal >=
                filteredSignal;

        bool pulseDetected =
            localMaximum &&
            previousFilteredSignal >
                threshold;

        if (pulseDetected && !beatLockout)
        {
            unsigned long beatTime = now;

            if (lastBeatTime == 0)
            {
                lastBeatTime = beatTime;

                beatLockout = true;
                beatLockoutStart = now;
            }
            else
            {
                unsigned long beatInterval =
                    beatTime - lastBeatTime;

                if (beatInterval >= MIN_BEAT_INTERVAL &&
                    beatInterval <= MAX_BEAT_INTERVAL)
                {
                    float bpm =
                        60000.0f /
                        beatInterval;

                    if (bpm >= MIN_BPM &&
                        bpm <= MAX_BPM)
                    {
                        currentBPM = bpm;

                        addBPM(currentBPM);

                        lastBeatTime = beatTime;

                        Serial.print("IR: ");
                        Serial.print(irValue);

                        Serial.print(" | RED: ");
                        Serial.print(redValue);

                        Serial.print(" | BPM: ");
                        Serial.print(currentBPM, 1);

                        Serial.print(" | AVG BPM: ");

                        if (validBpmCount >= 2)
                        {
                            Serial.print(
                                averageBPM,
                                1
                            );
                        }
                        else
                        {
                            Serial.print("--");
                        }

                        Serial.println();
                    }
                }
                else if (beatInterval > MAX_BEAT_INTERVAL)
                {
                    lastBeatTime = beatTime;
                }

                beatLockout = true;
                beatLockoutStart = now;
            }
        }


        if (!spo2Complete)
        {
            float irDelta =
                irValue - irMean;

            float redDelta =
                redValue - redMean;

            irMean +=
                irDelta /
                (spo2SampleCount + 1);

            redMean +=
                redDelta /
                (spo2SampleCount + 1);

            irSquareSum +=
                irDelta *
                (irValue - irMean);

            redSquareSum +=
                redDelta *
                (redValue - redMean);

            spo2SampleCount++;


            if (now - spo2StartTime >= SPO2_MEASUREMENT_TIME)
            {
                bool validSpO2 =
                    calculateSpO2();

                if (validSpO2)
                {
                    Serial.print("SpO2: ");
                    Serial.print(currentSpO2, 1);

                    Serial.print(" % | AVG SpO2: ");
                    Serial.print(averageSpO2, 1);

                    Serial.println();

                    spo2Complete = true;

                    if (validBpmCount >= 2)
                    {
                        measurementReady = true;
                    }
                }
                else
                {
                    spo2StartTime = now;

                    spo2SampleCount = 0;

                    irMean = irValue;
                    redMean = redValue;

                    irSquareSum = 0;
                    redSquareSum = 0;
                }
            }
        }
    }


    previousPreviousFilteredSignal =
        previousFilteredSignal;

    previousFilteredSignal =
        filteredSignal;
}