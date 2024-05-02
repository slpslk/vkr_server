import { Gateway } from './gateway.js';

export class BLEGateway extends Gateway{

  type = 'ble'

  constructor(properties) {
    super(properties.id, properties.name, properties.versions, properties.opRange)
  }
}