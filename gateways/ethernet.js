import { v4 as uuidv4 } from 'uuid';
import { Gateway } from './gateway.js';

export class EthernetGateway extends Gateway{

  type = 'ethernet'
  constructor(name, opRange) {
    super(name, null, opRange)
  }
  
}