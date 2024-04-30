import { Sensor } from "./sensor.js";


export class TemperatureSensor extends Sensor {
  
  type = 'temperature'

  constructor(name, place, meanTimeFailure, protocol, connectionOptions, measureRange, sendingPeriod, weatherAPI) {
    super(name, place, meanTimeFailure, protocol, connectionOptions, sendingPeriod);
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
    this.measureRange = measureRange;
    
  }


  async makeSensorData() {
    const realData = await this.getRealData();
    let sensorData;

    if (this.place) {
      sensorData = (realData.temp + 22) / 2;
    } 
    else {
      sensorData = realData.temp;
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

  
}






