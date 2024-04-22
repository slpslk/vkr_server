import { v4 as uuidv4 } from 'uuid';

export class Gateway{

  constructor(name) {
    this.id = uuidv4();
    this.name = name;
    this.devices = [];
    this.replacer = (key, value) => {
      devicesReplace = []
      if(this.devices.length !== 0) {
        devicesReplace = devices.map((device) => ({
          id: device.id,
          name: device.name
        }))
      }
      return (key == 'devices') ? devicesReplace : value;
    }
  }

  connectDevice(device) {
    if(device.physicalProtocol == this.type) {
      this.devices.push(device);
      device.gateway = this;
      console.log(`Connected to gateway ${this.name}`)
    }
  }
}