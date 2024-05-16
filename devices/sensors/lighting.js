import { Sensor } from "./sensor.js";
import * as mqtt from "mqtt";

export class LightingSensor extends Sensor {
  type = 'lighting'

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
    const realDataTime = new Date(realData.dt * 1000).getHours()
    const realDataRain = realData.rain
    const realDataClouds = realData.clouds.all
    
    let sensorData;

    if (realDataTime == 23 || realDataTime < 5 ) // night
    {
      if (realDataRain !== undefined || realDataClouds > 30) {
        sensorData = 0;
      }
      else {
        sensorData = 20
      }
    }
    else if (realDataTime >= 11 && realDataTime < 17) {
      if (realDataRain !== undefined || realDataClouds > 30) {
        sensorData = 1000;
      }
      else {
        sensorData = 5000;
      }
    }
    else {
      if (realDataRain !== undefined || realDataClouds > 30) {
        sensorData = 40;
      }
      else {
        sensorData = 400;
      }
    }

    if (this.place) {
      sensorData = (sensorData + 200) / 2;
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


