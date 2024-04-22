import { Sensor } from "./sensor.js";
import * as mqtt from "mqtt";

export class HumiditySensor extends Sensor {
  weatherParams = new URLSearchParams({
    q: "Novosibirsk",
    appid: "d50880dea21e32fb9a2a420c9f68a961",
    units: "metric",
  });

  constructor(name, place, meanTimeFailure, protocol) {
    super(name, place, meanTimeFailure, protocol);

    this.workTemperatures = {
      min: -40,
      max: 85,
    };
    this.measureError = {
      min: 10,
      max: 100,
      optimalError: 5,
    };

    this.sendingPeriod = 5000;
  }

  connect() {
    if (this.mqttClient == "none") {
      console.log(`${new Date()} Sensor: ${this.name} is connected. Protocol: HTTP`);
    } 
    else {
      this.mqttClient = mqtt.connect(
        "mqtt://dev.rightech.io",
        this.mqttConnectionOptions
      );

      this.mqttClient.on("connect", () => {
        console.log(`${new Date()}  Sensor: ${this.name} is connected. Protocol: MQTT`);
        this.mqttClient.subscribe("base/relay/+");
      });

      this.mqttClient.on("message", (topic, message) => {
        console.log(`${new Date()}: [${topic}] ${message.toString()}`);
      });

      this.mqttClient.on("end", () => {
        console.log(`${new Date()}: disconnected, ended`);
      });
    }
  }

  async getRealData() {
    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?${this.weatherParams}`);
    const realData = await response.json();
    return realData.main;
  }

  async makeSensorData() {
    const realData = await this.getRealData();
    let sensorData;

    if (this.place) {
      sensorData = (realData.humidity + 45) / 2;
    } 
    else {
      sensorData = realData.humidity;
    }

    // console.log('Sensor data ' + sensorData)

    sensorData = (sensorData + Math.random() * this.measureError.optimalError).toFixed(1);
      // console.log('opt error ' + sensorData)

    
    return sensorData;
  }

  workThrowMQTT() {
    this.itervalID = setInterval(async () => {
      this.mqttClient.publish("base/state/humidity", String(await this.makeSensorData()));
      // console.log('Temperature now: ' + await this.makeSensorData());
    }, this.sendingPeriod);
  }

  work() {
    if (this.mqttClient == "none") {

    }
    else {
      this.workThrowMQTT();
    }
  }

  debugLog() {
    console.log(this.measureError.optimalError);
  }

  disconnect() {
    this.mqttClient.end();
    clearInterval(this.itervalID);
    console.log(this.client);
  }
}

let hSensor = new HumiditySensor('Влажность', false, 10, 'mqtt')
hSensor.connect()
hSensor.work()
