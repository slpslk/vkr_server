async function post() {
  const response = await fetch('https://dev.rightech.io/api/v1/models', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NWY4NDQwZjkwNDkxZjQ5ODZkZTIwMTYiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxMDc2OTE2NywiZXhwIjoxNzEzMjg2ODAwfQ.-_IWmkFS4Je1WAEANf-Np-8lKLrDKCZpmLwH4TBizHg',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "base": "mqtt",
    "name": "111"
    }),
    // "mode":"cors"
  });

  if (response.ok){
  const data = await response.json();
  console.log(data);
  }
  else {
    console.log(response.status);
  }
};



async function getObj() {
  const response = await fetch('https://dev.rightech.io/api/v1/objects', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjE0MTNkYWQxMzc5NWU5Y2M3NzE4NDAiLCJzdWIiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODIiLCJncnAiOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJvcmciOiI2NWYyZTUyOTkwNDkxZjQ5ODZkZTFhODEiLCJsaWMiOiI1ZDNiNWZmMDBhMGE3ZjMwYjY5NWFmZTMiLCJ1c2ciOiJhcGkiLCJmdWxsIjpmYWxzZSwicmlnaHRzIjoxLjUsImlhdCI6MTcxMjU5MTgzNCwiZXhwIjoxNzE1MTAxMjAwfQ.F4EitbovA56tmJHp5cbMvtIivmds6_MgDOERRB__8qQ',
    'Content-Type': 'application/json'
  },
 
    // "mode":"cors"
  });


  const data = await response.json();
  console.log(data);
};

async function makeDevice() {
  const response = await fetch('http://localhost:8000/api/devices/temperature', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Temperature sensor test obj",
    place: false,
    meanTimeFailure: 0.5,
    protocol: {physical: 'Ethernet', message: 'MQTT'}
  })
  });

  const data = await response.json();
  console.log(data);
};

async function onDevice() {
  const response = await fetch('http://localhost:8000/api/devices/temperature/00c64460-8104-473a-8a2b-fcf16714a0d3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    control: "true"
  })
  });

  const data = await response.json();
  console.log(data);
};

async function offDevice() {
  const response = await fetch('http://localhost:8000/api/devices/temperature/00c64460-8104-473a-8a2b-fcf16714a0d3', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    control: "false"
  })
  });

  const data = await response.json();
  console.log(data);
};

async function getStorage() {
  const response = await fetch('http://localhost:8000/api/devices', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
  });

  const data = await response.json();
  console.log(JSON.parse(data));
};

// makeDevice()

const exmp = ['5', '6']
const obj = {
  versions: exmp
}
console.log(obj)