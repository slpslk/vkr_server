import { v4 as uuidv4 } from 'uuid';
import * as mqtt from "mqtt";
import {getUserTokenAPI} from "../../userStorage.js"
const UTC_COEF = 100000;
const TO_MILISECONDS = 60000;

export class Sensor {

  constructor(id, name, place, meanTimeFailure, protocol, connectionOptions, sendingPeriod) {
    if(id !== undefined) {
      this.id = id
    }
    else {
      this.id = uuidv4();
    }
    this.name = name;
    this.place = place;

    if(meanTimeFailure !== undefined) {
      this.meanTimeFailure = (((-1/meanTimeFailure) * Math.log(Math.random())) * TO_MILISECONDS).toFixed();
      this.lyambda = meanTimeFailure
    }
    else {
      this.meanTimeFailure = null;
    }

    this.gateway = null;
    
    this.physicalProtocol = protocol.physical;
    this.protocolVersions = protocol.versions;
    this.connectionError = false;
    this.reconnectingOption = true;
    this.broker = protocol.broker;
    if (protocol.message == 'MQTT')
    {
      this.mqttClient = null;
      if (protocol.broker == 'rightech') {
        this.brokerURL = "mqtt://dev.rightech.io"
        this.sendingTopic = connectionOptions.sendingTopic;
      }
      else {
        this.brokerURL = "ws://localhost:1884"//сделать изменяемый порт
        this.lastMQTTPublish = null
        this.sendingTopic = `${this.id}/${this.type}`;//инициализировать type в конструкторе, пока передает undefined
      }
      this.ConnectionOptions = {
        clientId: connectionOptions.clientId, 
        username: connectionOptions.username,
        password: connectionOptions.password,
        reconnectPeriod: 0,
      }

      
      this.QoS = connectionOptions.QoS;
    }
    else{
      this.mqttClient = 'none';
      this.ConnectionOptions = {
        clientId: connectionOptions.clientId,
        apiToken: getUserTokenAPI()
      }
    }
    

    this.sendingPeriod = sendingPeriod * TO_MILISECONDS;
  }

  physicalConnect() {
    if (this.gateway !== null) {
      // if(this.gateway.versions.toString() != this.protocolVersions.toString()) {
      //   return false
      // }
      return true;
    }
    return false;
  }

  async connectThroughMQTT() {
    try {
      this.mqttClient = await mqtt.connectAsync(
        this.brokerURL,
        this.ConnectionOptions
      )

    }
    catch(error) {
      console.log(error);
      this.connectionError = true
    }

  }

  async connectThroughHTTP() {
    const dataType = this.type
    const response = await fetch(`https://dev.rightech.io/api/v1/objects/${this.ConnectionOptions.clientId}/packets`,
    {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${this.ConnectionOptions.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        [dataType]: await this.makeSensorData(),
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

  setMqttClientEvents() {
    this.mqttClient.on("connect", () => {
      console.log(
        `${new Date()}  Sensor: ${this.name} is connected. Protocol: MQTT`
      );
      if(this.broker == "rightech") {
        this.mqttClient.subscribe("base/relay/+");
      }
      else {
        this.mqttClient.subscribe(this.sendingTopic);
      }
      this.connectionError = false
    });

    this.mqttClient.on("message", (topic, message) => {
      console.log(`${new Date()}: [${topic}] ${message.toString()}`);
      if(this.broker !== "rightech") {
        this.lastMQTTPublish = message.toString()
      }
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

          console.log(
            `${new Date()}  Sensor: ${this.name} is connected. Protocol: MQTT`
          );
          if(this.broker == "rightech") {
            this.mqttClient.subscribe("base/relay/+");
          }
          else {
            this.mqttClient.subscribe(this.sendingTopic);
          }
          this.connectionError = false
          this.setMqttClientEvents()
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
    return realData;
  }

  workThroughHTTP() {

    this.intervalID = setInterval(async () => {
      const dataType = this.type
      const response = await fetch(`https://dev.rightech.io/api/v1/objects/${this.ConnectionOptions.clientId}/packets`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${this.ConnectionOptions.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [dataType]: await this.makeSensorData(),
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
    console.log(`${this.type} now: ` + data);
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
    delete this.intervalID;
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
  
  async getRightechCurrentData(token) {

    const response = await fetch(`https://dev.rightech.io/api/v1/objects/${this.ConnectionOptions.clientId}`, {
    method: 'GET',
    headers: {
      // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjE0MTNkYWQxMzc5NWU5Y2M3NzE4NDAiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxMjU5MTgzNCwiZXhwIjoxNzE1MTAxMjAwfQ.F4EitbovA56tmJHp5cbMvtIivmds6_MgDOERRB__8qQ',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    });

    const data = await response.json();
    console.log(data)

    return {
      currentData: data.state[this.type],
      online: this.mqttClient == "none" ? this.intervalID !== undefined : data.state.online
    };
  }

  getPersonalBrokerCurrentData() {
    return {
      currentData: this.lastMQTTPublish,
      online: this.intervalID !== undefined
    };
  }

  async getCurrentData(token) {
    if(this.broker == "rightech") {
      return await this.getRightechCurrentData(token)
    }
    else {
      return this.getPersonalBrokerCurrentData()
    }
  }

  changeGeneralProperties(newProps) {
    for(var key in newProps) {
      if(key == 'meanTimeFailure') {
        if(meanTimeFailure !== undefined) {
          this.meanTimeFailure = (((-1/meanTimeFailure) * Math.log(Math.random())) * TO_MILISECONDS).toFixed();
          this.lyambda = meanTimeFailure
        }
        else {
          this.meanTimeFailure = null;
        }
      }
      if(newProps[key]) {
        if(key == 'protocol') {
          this.physicalProtocol = newProps[key].physical;
          this.protocolVersions = newProps[key].versions;
          if(this.mqttClient == 'none' && newProps[key].message == 'MQTT') {
            this.mqttClient = null;
            this.ConnectionOptions = {
              clientId: connectionOptions.clientId,
              username: connectionOptions.username,
              password: connectionOptions.password,
              reconnectPeriod: 0,
            };
            this.sendingTopic = connectionOptions.sendingTopic;
            this.QoS = connectionOptions.QoS;
          }
          if(this.mqttClient !== 'none' && newProps[key].message == 'HTTP') {
            this.mqttClient = 'none';
            this.ConnectionOptions = {
              clientId: connectionOptions.clientId,
              apiToken: getUserTokenAPI()
            }
          }
        }
        else if(key == 'sendingPeriod') {
          this.sendingPeriod = sendingPeriod * TO_MILISECONDS;
        }
        else {
          this[key] = newProps[key]
        }
      }
    }
    

    
  }

}