import { v4 as uuidv4 } from 'uuid';
import * as mqtt from "mqtt";
import {UserStorage} from "../../storages/index.js";

const TO_MILISECONDS = 60000;

export class Controlled {

  constructor(id, name, meanTimeFailure, protocol, sendingPeriod, connectionOptions, opRange) {
    if(id !== undefined) {
      this.id = id
    }
    else {
      this.id = uuidv4();
    }
    this.name = name;
    if(meanTimeFailure !== undefined) {
      this.meanTimeFailure = (((-1/meanTimeFailure) * Math.log(Math.random())) * TO_MILISECONDS).toFixed();
      this.lyambda = meanTimeFailure
    }
    else {
      this.meanTimeFailure = null;
    }
    this.online = false;
    this.status = false;
    this.gateway = null;
    this.opRange = opRange
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
        this.brokerURL = `ws://localhost:`
        this.sendingTopic = `${this.id}${connectionOptions.sendingTopic}`;
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
        apiToken: UserStorage.getUserTokenAPI()
      }
    }
    this.sendingPeriod = sendingPeriod * TO_MILISECONDS;
  }


  physicalConnect() {
    if (this.gateway !== null) {
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
    const response = await fetch(`https://dev.rightech.io/api/v1/objects/${this.ConnectionOptions.clientId}/packets`,
    {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${this.ConnectionOptions.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: String(this.status),
      }),
    }
    );
    if (response.ok) {
      console.log(`${new Date()} Device: ${this.name} is connected. Protocol: HTTP`);
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
        this.mqttClient.subscribe("base/relay/turn");
      }
      else {
        this.mqttClient.subscribe(`${this.id}/turn`);
      }

      this.mqttClient.publish(this.sendingTopic, this.status);
      console.log('Current status: ' + this.status);

      this.connectionError = false
    });

    this.mqttClient.on("message", async (topic, message) => {
      console.log(`${new Date()}: [${topic}] ${message}`);
      const messageData = JSON.parse(message.toString());
      await this.changeStatus(this.broker == "rightech"? messageData.status : messageData)
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
          this.online = true;
          this.setFailureTimeout();
          return true;
        }
        else {
          return false;
        }
      } 
      else {
        if (this.broker == "personal") {
          this.brokerURL = this.brokerURL + UserStorage.getUserBroker().port
        }
        await this.connectThroughMQTT()

        if(this.mqttClient !== null) {

          this.online = true
          console.log(`${new Date()}  Sensor: ${this.name} is connected. Protocol: MQTT`);
          
          if(this.broker == "rightech") {
            this.mqttClient.subscribe("base/relay/turn");
          }
          else {
            this.mqttClient.subscribe(`${this.id}/turn`);
          }
          this.mqttClient.publish(this.sendingTopic, String(this.status));
          console.log('Current status: ' + this.status);

          this.connectionError = false
          this.setMqttClientEvents()
          this.setFailureTimeout();
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

  async setFailureTimeout() {
    if (this.meanTimeFailure !== null) {
      this.failureTimeoutId = setTimeout(() => {
        console.log("Устройство вышло из строя! (Наработка на отказ)");
        this.disconnect();
      }, this.meanTimeFailure)
    }
  }

  async changeStatus(status) {
    this.status = status;
    if (this.mqttClient == "none") {
      const response = await fetch(`https://dev.rightech.io/api/v1/objects/${this.ConnectionOptions.clientId}/packets`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${this.ConnectionOptions.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: String(this.status),
        }),
      }
      );
    }
    else {
      this.mqttClient.publish(this.sendingTopic, String(this.status));
      console.log('Current status: ' + this.status);
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

  disconnectMQTT() {
    this.mqttClient.end();
    this.online = false;
    this.status = false;
    clearTimeout(this.failureTimeoutId);
  }

  disconnectHTTP() {
    console.log(`${new Date()} Sensor: ${this.name} was disconnected.`);
    this.online = false;
    this.status = false;
    clearTimeout(this.failureTimeoutId);
  }

  disconnect() {
    if (this.mqttClient == "none") {
      this.disconnectHTTP();
    }
    else {
      this.disconnectMQTT();
    }
  }


  async getRightechCurrentData(token) {

    const response = await fetch( `https://dev.rightech.io/api/v1/objects/${this.ConnectionOptions.clientId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    });

    const data = await response.json();

    return {
      currentData: data.state.status,
      online: this.online
    };
  }

  getPersonalBrokerCurrentData() {
    return {
      currentData: this.status,
      online: this.online
    }
  }

  async changeMQTTStatusRightech(status, token) {
    console.log('changeMQTTStatusRightech')
    const command = status? 'turnOn': 'turnOff'
    const response = await fetch( `https://dev.rightech.io/api/v1/objects/${this.ConnectionOptions.clientId}/commands/${command}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    });

    const data = await response.json();

    return response.ok ? true: false;
  }

  changeMQTTStatusPersonal(status) {
    this.mqttClient.publish(`${this.id}/turn`, String(status));
    return true
  }

  async changeStatusMQTT(status, token) {
    if (this.broker == "rightech") {
      console.log('changeStatusMQTT')
      return await this.changeMQTTStatusRightech(status, token)
    }
    else {
      return this.changeMQTTStatusPersonal(status)
    }
  }


  async changeStatusHTTP(status) {
    this.changeStatus(status);
    return true;
  }

  async changeDeviceStatus(status, token) {
    if (this.mqttClient == "none") {
      return await this.changeStatusHTTP(status);
    }
    else {
      console.log('changeDeviceStatus')
      return this.changeStatusMQTT(status, token);
    }
  }

  async getCurrentData(status, token) {
    if(this.broker == "rightech") {
      return await this.getRightechCurrentData(status,token)
    }
    else {
      return this.getPersonalBrokerCurrentData()
    }
  }

}