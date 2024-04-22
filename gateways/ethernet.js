import { v4 as uuidv4 } from 'uuid';

export class EthernetGateway{

  type = 'ethernet'
  constructor(name) {
    this.id = uuidv4();
    this.name = name;
    this.devices = [];
  }

  connectDevice(device) {
    if(device.physicalProtocol == this.type) {
      this.devices.push(device);
      device.gateway = this;
      console.log(`Connected to gateway ${this.name}`)
      return true
    }
    else {
      return false
    }
  }
}