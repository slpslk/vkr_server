import { Sensor } from "./sensor.js";
import * as mqtt from "mqtt";

export class NoiseSensor extends Sensor {
  type = 'noise'

  constructor(properties) {
    super(properties.id, properties.name, properties.place, properties.meanTimeFailure, properties.protocol, properties.connectionOptions,
          properties.sendingPeriod);

    this.measureRange = properties.measureRange;
    this.permissibleValue = properties.permissibleValue
    this.generationRange = {
      min: 30,
      max: 60
    }
  }

  async makeSensorData() {
    const noiseData = this.generationRange.min + Math.random() * (this.generationRange.max + 1 - this.generationRange.min);
    let sensorData = noiseData;

    if (sensorData <= this.measureRange.min) {
      sensorData = this.measureRange.min
    }
    else if (sensorData >= this.measureRange.max){
      sensorData = this.measureRange.max
    }
    else {
      sensorData = (sensorData + Math.random() * this.measureRange.error).toFixed(1);
    }
    
    return sensorData;
  }

  noiseEvent() {
    console.log('noiseEvent')
    this.generationRange = {
      min: this.permissibleValue,
      max: this.permissibleValue + 50,
    } 
    this.eventTimeout = setTimeout(() =>{
      this.generationRange = {
        min: 30,
        max: 60,
      };
    }, this.sendingPeriod*2)

    console.log(this.generationRange)
  }

  async getCurrentData(token) {
    const {currentData, online} = await super.getCurrentData(token);
    return {
      currentData: currentData,
      online: online,
      alarm: (this.permissibleValue > currentData) ? false : true
    }
  }

  changeProperties(newProps) {
    if(newProps.measureRange) {
      this.measureRange = newProps.measureRange
    }
    this.changeGeneralProperties(newProps)
  }
}

