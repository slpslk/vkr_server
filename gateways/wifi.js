
import { v4 as uuidv4 } from 'uuid';

export class WifiGateway{

  type = 'wifi'
  constructor(name, versions) {
    this.id = uuidv4();
    this.name = name;
    this.versions = versions;
    this.devices = [];
  }

  connectDevice(device) {
    if(device.physicalProtocol == this.type) {
      commonVersions = this.versions.filter(item => device.protocolVersions.includes(item));
      if(commonVersions.length !== 0) {
        this.devices.push(device);
        device.gateway = this;
        console.log(`Connected to gateway ${this.name}`);
      }
    }
  }
}