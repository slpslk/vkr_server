import { Sensor } from "./sensor.js";


export class TemperatureSensor extends Sensor {
  type =  'temperature';

  constructor(properties) {
    super(properties.id, properties.name, properties.place, properties.meanTimeFailure, properties.protocol, properties.connectionOptions,
          properties.sendingPeriod);
          
    this.weatherParams = new URLSearchParams({
      q: "Novosibirsk",
      appid: "d50880dea21e32fb9a2a420c9f68a961",
      units: "metric",
    });
    this.measureRange = properties.measureRange;
  }


  async makeSensorData() {
    const realData = await this.getRealData();
    const realDataTemp = realData.main.temp
    let sensorData;

    if (this.place) {
      sensorData = (realDataTemp + 22) / 2;
    } 
    else {
      sensorData = realDataTemp;
    }

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

  changeProperties(newProps) {
    if(newProps.measureRange) {
      this.measureRange = newProps.measureRange
    }
    this.changeGeneralProperties(newProps)
  }
  
}






