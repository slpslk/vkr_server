import { Sensor } from "./sensor.js";
import * as mqtt from "mqtt";

export class TemperatureSensor extends Sensor {
  
  type = 'temperature'

  constructor(name, place, meanTimeFailure, protocol, connectionOptions, measureRange, sendingPeriod, weatherAPI) {
    super(name, place, meanTimeFailure, protocol, connectionOptions, sendingPeriod);
    this.measureRange = {
      min: -10,
      max: 40,
      error: 0.5,
      opRange: 1000 //дальность работы
    };

    this.weatherParams = new URLSearchParams({
      q: "Novosibirsk",
      appid: "d50880dea21e32fb9a2a420c9f68a961",
      units: "metric",
    });

    // this.weatherParams = new URLSearchParams({
    //   q: this.weatherAPI.q,
    //   appid: this.weatherAPI.appid,
    //   units: this.weatherAPI.units
    // })
    // this.measureRange = measureRange;
    
  }

  physicalConnect() {
    if (this.gateway !== null) return true;
    return false;
  }

  connect() {

    if (this.physicalConnect()) {
      if (this.mqttClient == "none") {
        console.log(
          `${new Date()} Sensor: ${this.name} is connected. Protocol: HTTP`
        );
      } else {
        this.mqttClient = mqtt.connect(
          "mqtt://dev.rightech.io",
          this.mqttConnectionOptions
        );

        this.mqttClient.on("connect", () => {
          console.log(
            `${new Date()}  Sensor: ${this.name} is connected. Protocol: MQTT`
          );
          this.mqttClient.subscribe("base/relay/+");
        });

        this.mqttClient.on("message", (topic, message) => {
          console.log(`${new Date()}: [${topic}] ${message.toString()}`);
        });

        this.mqttClient.on("end", () => {
          console.log(`${new Date()} Sensor: ${this.name} was disconnected.`);
        });
      }
      return true;
    }
    else {
      console.log("Ошибка подключения: подключитесь к шлюзу и убедитесь, что выбран верный протокол и версия!");
      return false;
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
      sensorData = (realData.temp + 22) / 2;
    } 
    else {
      sensorData = realData.temp;
    }

    if (sensorData <= this.measureRange.min) {
      sensorData = this.measureRange.min
    }
    else if (sensorData >= this.measureRange.max){
      sensorData = this.measureRange.max
    }
    else {
      sensorData = (sensorData + Math.random() * this.measureRange.error).toFixed(1);
    }

    return sensorData;
  }

  workThrowHTTP() {

    this.itervalID = setInterval(async () => {
      const response = await fetch("https://dev.rightech.io/api/v1/objects/6614e5edb5ee4df6483c0753/packets",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NWY4NDQwZjkwNDkxZjQ5ODZkZTIwMTYiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxMDc2OTE2NywiZXhwIjoxNzEzMjg2ODAwfQ.-_IWmkFS4Je1WAEANf-Np-8lKLrDKCZpmLwH4TBizHg",
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temperature: await this.makeSensorData(),
          }),
        }
      );
      
    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      clearInterval(this.itervalID);
      console.log("Произошла ошибка во время выполнения запроса! Код ошибки: " + response.status)
    }
    }, this.sendingPeriod);
    
  }

  workThrowMQTT() {
    this.itervalID = setInterval(async () => {
      let data = String(await this.makeSensorData());
      this.mqttClient.publish("base/state/temperature", data);
      console.log('Temperature now: ' + data);
    }, this.sendingPeriod);
  }

  work() {
    if (this.mqttClient == "none") {
      this.workThrowHTTP();
    }
    else {
      this.workThrowMQTT();
    }
    setTimeout(() => {
      console.log("Устройство вышло из строя! (Наработка на отказ)");
      this.disconnect();
    }, this.meanTimeFailure)
  }

  disconnectMQTT() {
    this.mqttClient.end();
    clearInterval(this.itervalID);
  }

  disconnectHTTP() {
    clearInterval(this.itervalID);
    console.log(`${new Date()} Sensor: ${this.name} was disconnected.`);
  }

  disconnect() {
    if (this.mqttClient == "none") {
      this.disconnectHTTP();
    }
    else {
      this.disconnectMQTT();
    }
  }
}

// let tSensor = new TemperatureSensor('Датчик', false, 17, )
// console.log(tSensor)
// // console.log(tSensor.meanTimeFailure)
// tSensor.connect()
// tSensor.work()
