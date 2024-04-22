import { v4 as uuidv4 } from 'uuid';
const UTC_COEF = 1000000;

export class Sensor {

  //this.operatingRange
  //this.protocol
  //this.operatingTemp
  //this.connectionType
  

  constructor(name, place, meanTimeFailure, protocol, connectionOptions, sendingPeriod) {
    this.id = uuidv4()
    this.name = name;
    this.place = place;
    this.meanTimeFailure = ((-1/meanTimeFailure) * Math.log(Math.random()) * UTC_COEF).toFixed();
    this.physicalProtocol = protocol.physical;
    this.gateway = null;
    this.protocolVersions = protocol.versions;
    if (protocol.message == 'MQTT')
    {
      this.mqttClient = null;
      // this.mqttConnectionOptions = connectionOptions;
      this.mqttConnectionOptions = {
        clientId: "mqtt-sofiavchinova-okwbfh", 
        username: "111",
        password: "111",
      }
    }
    else{
      this.mqttClient = 'none';
    }

    this.sendingPeriod = 5000;
    // this.sendingPeriod = sendingPeriod;
    this.replacer = (key, value) => {
      const gatewayReplace = {
        id:this.gateway.id,
        name:this.gateway.name
      }
      return (key == 'gateway') ? gatewayReplace : value;
    }
  }

  connect() {
    console.log('sensor is connected')
  }

  work() {
    console.log('sensor is working now');
  }

  disconnect() {
    console.log('sensor was disconnected')
  }
}