import { v4 as uuidv4 } from 'uuid';
import * as mqtt from "mqtt";
import {getUserTokenAPI} from "../userStorage.js"
const UTC_COEF = 100000;
const TO_MILISECONDS = 60000;

export class Sensor {

  constructor(name, place, meanTimeFailure, protocol, connectionOptions, sendingPeriod) {
    this.id = uuidv4();
    this.name = name;
    this.place = place;

    if(meanTimeFailure !== undefined) {
      this.meanTimeFailure = (((-1/meanTimeFailure) * Math.log(Math.random())) * TO_MILISECONDS).toFixed();
    }
    else {
      this.meanTimeFailure = null;
    }

    this.gateway = null;
    
    this.physicalProtocol = protocol.physical;
    this.protocolVersions = protocol.versions;
    this.connectionError = false;
    this.reconnectingOption = true;
    if (protocol.message == 'MQTT')
    {
      this.mqttClient = null;
      this.mqttConnectionOptions = {
        clientId: connectionOptions.clientId, 
        username: connectionOptions.username,
        password: connectionOptions.password,
        reconnectPeriod: 0,
      }
      this.sendingTopic = connectionOptions.sendingTopic;
      this.QoS = connectionOptions.QoS;
    }
    else{
      this.mqttClient = 'none';
      this.httpConnectionOptions = {
        clientId: connectionOptions.clientId,
        apiToken: getUserTokenAPI()
      }
    }
    this.broker = protocol.broker;

    this.sendingPeriod = sendingPeriod * TO_MILISECONDS;
  }

  physicalConnect() {
    if (this.gateway !== null) return true;
    return false;
  }

  async connectThroughMQTT() {
    try {
      this.mqttClient = await mqtt.connectAsync(
      "mqtt://dev.rightech.io",
      this.mqttConnectionOptions
      )
    }
    catch(error) {
      console.log(error);
      this.connectionError = true
    }

  }

  async connectThroughHTTP() {
    const response = await fetch(`https://dev.rightech.io/api/v1/objects/${this.httpConnectionOptions.clientId}/packets`,
    {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${this.httpConnectionOptions.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        temperature: await this.makeSensorData(),
      }),
    }
    );
    if (response.ok) {
      console.log(`${new Date()} Sensor: ${this.name} is connected. Protocol: HTTP`);
      return true;
    }
    else {
      this.connectionError = true
      return false;
    }
  }

  async connect() {
    if (this.physicalConnect()) {
      if (this.mqttClient == "none") {
        if (await this.connectThroughHTTP()) {
          return true;
        }
        else {
          return false;
        }
      } 
      else {
        await this.connectThroughMQTT()

        if(this.mqttClient !== null) {
          this.mqttClient.on("connect", () => {
            console.log(
              `${new Date()}  Sensor: ${this.name} is connected. Protocol: MQTT`
            );
            this.mqttClient.subscribe("base/relay/+");
            this.connectionError = false
          });
    
          this.mqttClient.on("message", (topic, message) => {
            console.log(`${new Date()}: [${topic}] ${message.toString()}`);
          });
    
          this.mqttClient.on("reconnect", () => {
            console.log(`${new Date()} Sensor: ${this.name} is reconnecting...`);
          });
    
          this.mqttClient.on("error", () => {
            console.log(`${new Date()} Connection error`);
            this.connectionError = true
          });
    
          this.mqttClient.on("end", () => {
            console.log(`${new Date()} Sensor: ${this.name} was disconnected.`);
          });
          return true;
        }
        else {
          return false;
        }
      }
      
    }
    else {
      return false;
    }
  }

  async getRealData() {
    const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?${this.weatherParams}`);
    const realData = await response.json();
    return realData.main;
  }

  workThroughHTTP() {

    this.intervalID = setInterval(async () => {
      const response = await fetch(`https://dev.rightech.io/api/v1/objects/${this.httpConnectionOptions.clientId}/packets`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${this.httpConnectionOptions.apiToken}`,
          'Content-Type': 'application/json'
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
      clearInterval(this.intervalID);
      console.log("Произошла ошибка во время выполнения запроса! Код ошибки: " + response.status)
    }
    }, this.sendingPeriod);
    
  }

  async sendMQTTMessage() {
    let data = String(await this.makeSensorData());
    this.mqttClient.publish(this.sendingTopic, data, 
    {qos: this.QoS}, () => {console.log(`qos${this.QoS} working successfuly`)});
    console.log('Temperature now: ' + data);
  }

  workThroughMQTT() {
    this.sendMQTTMessage()
    this.intervalID = setInterval(async () => {
      this.sendMQTTMessage();
    }, this.sendingPeriod);
  }

  work() {
    if (this.mqttClient == "none") {
      this.workThroughHTTP();
    }
    else {
      this.workThroughMQTT();
    }
    if (this.meanTimeFailure !== null) {
      this.failureTimeoutId = setTimeout(() => {
        console.log("Устройство вышло из строя! (Наработка на отказ)");
        this.disconnect();
      }, this.meanTimeFailure)
    }
  }

  disconnectMQTT() {
    this.mqttClient.end();
    clearInterval(this.intervalID);
    clearTimeout(this.failureTimeoutId);
  }

  disconnectHTTP() {
    clearInterval(this.intervalID);
    delete this.intervalID
    clearTimeout(this.failureTimeoutId);
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

  async reconnect() {
    if (this.mqttClient == "none") {
      return await this.connectThroughHTTP()
    }
    else {
      await this.mqttClient.reconnect()
      return true;
    }
  }
  
  

  async getRightechCurrentData(token, type) {

    let url = null
    if (this.mqttClient == "none")
    {
      url = `https://dev.rightech.io/api/v1/objects/${this.httpConnectionOptions.clientId}`
    }
    else {
      url = `https://dev.rightech.io/api/v1/objects/${this.mqttConnectionOptions.clientId}`
    }

    const response = await fetch(url, {
    method: 'GET',
    headers: {
      // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjE0MTNkYWQxMzc5NWU5Y2M3NzE4NDAiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxMjU5MTgzNCwiZXhwIjoxNzE1MTAxMjAwfQ.F4EitbovA56tmJHp5cbMvtIivmds6_MgDOERRB__8qQ',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    });

    const data = await response.json();

    return {
      currentData: data.state[type],
      online: this.mqttClient == "none" ? this.intervalID !== undefined : data.state.online
    };
  }

}