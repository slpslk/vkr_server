import { v4 as uuidv4 } from 'uuid';
import * as mqtt from "mqtt";
import {getUserTokenAPI} from "../../userStorage.js"
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

    if (protocol.message == 'MQTT')
    {
      this.mqttClient = null;
      this.ConnectionOptions = {
        clientId: connectionOptions.clientId, 
        username: connectionOptions.username,
        password: connectionOptions.password,
        reconnectPeriod: 0,
      }
      this.sendingTopic = connectionOptions.sendingTopic;
    }
    else{
      this.mqttClient = 'none';
      this.ConnectionOptions = {
        clientId: connectionOptions.clientId,
        apiToken: getUserTokenAPI()
      }
    }
    this.broker = protocol.broker;
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
      "mqtt://dev.rightech.io",
      this.ConnectionOptions
      )
    }
    catch(error) {
      console.log(error);
      this.connectionError = true
    }

  }

  async connectThroughHTTP() {
    console.log({status: String(this.status)})
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
        await this.connectThroughMQTT()

        if(this.mqttClient !== null) {

          this.online = true
          console.log(`${new Date()}  Sensor: ${this.name} is connected. Protocol: MQTT`);
          
          this.mqttClient.subscribe("base/relay/turn");
          this.mqttClient.publish(this.sendingTopic, String(this.status));
          console.log('Current status: ' + this.status);

          this.connectionError = false

          this.mqttClient.on("connect", () => {
            console.log(
              `${new Date()}  Sensor: ${this.name} is connected. Protocol: MQTT`
            );
            
            this.mqttClient.subscribe("base/relay/turn");
            this.mqttClient.publish(this.sendingTopic, this.status);
            console.log('Current status: ' + this.status);

            this.connectionError = false
          });
    
          this.mqttClient.on("message", async (topic, message) => {
            console.log(`${new Date()}: [${topic}] ${message}`);
            const messageData = JSON.parse(message.toString());

            await this.changeStatus(messageData.status)
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
      // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjE0MTNkYWQxMzc5NWU5Y2M3NzE4NDAiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxMjU5MTgzNCwiZXhwIjoxNzE1MTAxMjAwfQ.F4EitbovA56tmJHp5cbMvtIivmds6_MgDOERRB__8qQ',
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

  async changeStatusMQTT(status, token) {
    const command = status? 'turnOn': 'turnOff'
    const response = await fetch( `https://dev.rightech.io/api/v1/objects/${this.ConnectionOptions.clientId}/commands/${command}`, {
    method: 'POST',
    headers: {
      // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjE0MTNkYWQxMzc5NWU5Y2M3NzE4NDAiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxMjU5MTgzNCwiZXhwIjoxNzE1MTAxMjAwfQ.F4EitbovA56tmJHp5cbMvtIivmds6_MgDOERRB__8qQ',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    });

    const data = await response.json();

    return response.ok ? true: false;
  }

  changeStatusHTTP(status) {
    this.changeStatus(status);
    return true;
  }

  async changeRighteckDeviceStatus(status, token) {
    if (this.mqttClient == "none") {
      return this.changeStatusHTTP(status);
    }
    else {
      return this.changeStatusMQTT(status, token);
    }
  }

  async getCurrentData(status, token) {
    if(this.broker == "rightech") {
      return await this.getRightechCurrentData(status,token)
    }
    // else {
    //   return this.getPersonalBrokerCurrentData()
    // }
  }

}