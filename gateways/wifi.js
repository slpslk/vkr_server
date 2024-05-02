import { Gateway } from './gateway.js';

export class WifiGateway extends Gateway{

  type = 'wifi'
  constructor(properties) {
    super(properties.id, properties.name, properties.versions, properties.opRange)
  }
}