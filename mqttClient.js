import * as mqtt from 'mqtt';

export class mqttClient {

  constructor() {
    this.client = null;
  }

  connectSensor() {
    this.client = mqtt.connect("mqtt://dev.rightech.io", {
      clientId: "mqtt-sofiavchinova-okwbfh", //вынести в options
      username: "111",
      password: "111",
    });

    this.client.on("connect", () => {
      console.log(`${new Date()}: connected`);
      this.client.subscribe("base/relay/+");
    });
  
    this.client.on("message", (topic, message) => {
      console.log(`${new Date()}: [${topic}] ${message.toString()}`);
    });
  
    this.client.on("end", () => {
      console.log(`${new Date()}: disconnected, ended`);
    });
  }
  startSensor() {
    this.itervalID = setInterval(async () => {
      this.client.publish("base/state/temperature", String(await modelTemperature()));
    }, 5000);
    // setInterval(() => {
    //   const rand = (Math.random() * 30).toFixed(2);
    //   this.client.publish("base/state/temperature", rand);
    // }, 5000);

    // const rand = (Math.random() * 30).toFixed(2);
    // this.client.publish("base/state/temperature", rand);
  }

  endSensor() {
    this.client.end()
    clearInterval(this.itervalID)
    console.log(this.client);
  }
}