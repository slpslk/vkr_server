import path from 'path';
import mosquittoPasswd from 'mosquitto-passwd'
import fs from 'fs';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function choosePort(ports) {
  return ports.shift()
}

export async function prepareFilesForCompose(port, username, password) {
  changeConf(port);
  changeCompose(username, port);
  await writePsswdFile(username, password);
}

export function prepareFilesForStop(username, port) {
  changeCompose(username, port);
}

export function prepareFilesForStart(port, username) {
  changeConf(port);
  changeCompose(username, port);
}

export function changeConf(port) {
fs.readFile(path.join(__dirname, "/configFiles/config/mosquitto.conf"), "utf-8", function (err, data) {
  if (err)
      return console.log(err);

  var field = "listener ";
  var re = RegExp("\\b" + field + "\\d{4}\\b", "g");

  data = data.replace(re, field + port);

  fs.writeFile(path.join(__dirname, "/configFiles/config/mosquitto.conf"), data, function(error){
    if(error){  // если ошибка
        return console.log(error);
    }
    console.log("Файл успешно записан");
  });
});
}

export function changeCompose(username, port) {
  try {
    const doc = yaml.load(fs.readFileSync(path.join(__dirname, "/configFiles/docker-compose.yml"), 'utf8'));
    doc.name = `project_${username}`
    doc.services.mosquitto.container_name = `mqtt${username}`
    doc.services.mosquitto.ports = [`${port}:${port}`]

    fs.writeFileSync(path.join(__dirname, "/configFiles/docker-compose.yml"), yaml.dump(doc));
  } catch (e) {
    console.log(e);
  }
}

export async function writePsswdFile(username, psswd) {
  const user = await mosquittoPasswd(username, psswd)
  
  fs.appendFile(path.join(__dirname, "/configFiles/config/pswdf"), `${user}\n`, function(error){
    if(error){  // если ошибка
        return console.log(error);
    }
    console.log("Файл успешно записан");
  });
}