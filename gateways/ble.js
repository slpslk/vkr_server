import { v4 as uuidv4 } from 'uuid';

export class BLEGateway{

  type = 'ble'

  constructor(name, versions) {
    this.id = uuidv4();
    this.name = name;
    this.versions = versions;
    this.devices = [];
  }

  connectDevice(device) {
    if(device.physicalProtocol == this.type) {
        this.devices.push(device);
        device.gateway = this;
        console.log(`Connected to gateway ${this.name}`);
    }
  }
}