import { Sensor } from "./sensor.js";
import * as mqtt from "mqtt";

export class HumiditySensor extends Sensor {
  type = 'humidity'

  constructor(properties) {
    super(properties.id, properties.name, properties.place, properties.meanTimeFailure, properties.protocol, properties.connectionOptions,
          properties.sendingPeriod);
    // this.measureRange = {
    //   min: -10,
    //   max: 40,
    //   error: 0.5,
    //   opRange: 1000 //дальность работы
    // };

    this.weatherParams = new URLSearchParams({
      q: "Novosibirsk",
      appid: "d50880dea21e32fb9a2a420c9f68a961",
      units: "metric",
    });

    // this.weatherParams = new URLSearchParams({
    //   q: this.weatherAPI.q,
    //   appid: this.weatherAPI.appid,
    //   units: this.weatherAPI.units
    // })
    this.measureRange = properties.measureRange;
    
  }


  async makeSensorData() {
    const realData = await this.getRealData();
    const realDataHumidity = realData.main.humidity
    let sensorData;

    if (this.place) {
      sensorData = (realDataHumidity + 45) / 2;
    } 
    else {
      sensorData = realDataHumidity;
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

