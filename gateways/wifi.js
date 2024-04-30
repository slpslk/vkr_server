import { v4 as uuidv4 } from 'uuid';
import { Gateway } from './gateway.js';

export class WifiGateway extends Gateway{

  type = 'wifi'
  constructor(name, versions, opRange) {
    super(name, versions, opRange)
  }
}