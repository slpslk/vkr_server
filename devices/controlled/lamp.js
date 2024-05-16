import { Controlled } from "./controlled.js";


export class Lamp extends Controlled {
  
  type = 'lamp'

  constructor(properties) {
    super(properties.id, properties.name, properties.meanTimeFailure, properties.protocol, properties.sendingPeriod, properties.connectionOptions, properties.opRange);
  }


  

  changeProperties(newProps) {
    if(newProps.measureRange) {
      this.measureRange = newProps.measureRange
    }
    this.changeGeneralProperties(newProps)
  }
  
}