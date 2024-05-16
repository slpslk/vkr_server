import { v4 as uuidv4 } from 'uuid';

export class Gateway{

  constructor(id, name, versions, opRange) {
    if(id !== undefined) {
      this.id = id
    }
    else {
      this.id = uuidv4();
    }
    this.name = name;
    this.versions = versions;
    this.opRange = opRange;
    this.devices = [];
  }

  connectDevice(device, distance) {
    
    if (this.type != 'ethernet') {
      if ((+device.measureRange.opRange + +this.opRange) > distance) {
        if (device.physicalProtocol == this.type) {
          if (this.versions !== null) {
            let commonVersions = this.versions.filter((item) =>
              device.protocolVersions.includes(item)
            );
            if (commonVersions.length == 0) {
              return {
                status: false,
                message: "Проверьте поддерживаемые версии протокола"
              }
            }
          }
            this.devices.push(device);
            device.gateway = this.id;
            console.log(`Connected to gateway ${this.name}`);
            return {
              status: true
            }
          } 
          else {
            return {
              status: false,
              message: "Устройство не поддерживает протокол шлюза"
            }   
        }
      } 
      else {
        return {
          status: false,
          message: "Устройство не обнаружено. Возможно, расстояние до устройства слишком большое"
        }   
      }
    }
    else {
      this.devices.push(device);
      device.gateway = this.id;
      console.log(`Connected to gateway ${this.name}`);
      return {
        status: true
      }
    }
  }

  deleteDevice(device) {
    this.devices = this.devices.filter((deleted) => deleted.id != device.id)
    device.gateway = null;
  }



  changeGatewayFields(fields) {
    for(var key in this) {
      if (fields[key] != null) {
        this[key] = fields[key]
      }
    }
  }
}