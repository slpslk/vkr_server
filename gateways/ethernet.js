import { Gateway } from './gateway.js';

export class EthernetGateway extends Gateway{

  type = 'ethernet'
  constructor(properties) {
    super(properties.id, properties.name, null, null) //убрать oprange
  }
  
}