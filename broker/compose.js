import path from 'path';
import { fileURLToPath } from 'url';
import * as compose from 'docker-compose'
import {prepareFilesForCompose, choosePort, prepareFilesForStop, prepareFilesForStart} from './dockerFilesPreparer.js'

const ports = Array(36).fill(1864).map((x, y) => x + y)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const brokerCompose = (username, password) => {
  var currentPort = choosePort(ports)
  prepareFilesForCompose(currentPort, username, password);

  compose.upAll({ cwd: path.join(__dirname, "/configFiles"), log: true })
  .then(
    () => { console.log('done')},
    err => { console.log('something went wrong:', err.message)}
  );

  return currentPort;
}

export const startBroker = (username) => {
  var currentPort = choosePort(ports)

  prepareFilesForStart(currentPort, username);

  compose.upAll({ cwd: path.join(__dirname, "/configFiles"), log: true })
  .then(
    () => { console.log('done')},
    err => { console.log('something went wrong:', err.message)}
  );

  return currentPort;
}

export const stopBroker = (username, port) => {

  prepareFilesForStop(username, port)

  compose.stopOne('mosquitto', { cwd: path.join(__dirname, "/configFiles"), log: true })
  .then(
    () => { console.log('done')},
    err => { console.log('something went wrong:', err.message)}
);
}



