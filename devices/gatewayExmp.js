async function getStorage() {
  const response = await fetch('http://localhost:8000/api/gateways', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
  });

  const data = await response.json();
  console.log(JSON.parse(data));
};

async function makeGateway() {
  const response = await fetch('http://localhost:8000/api/gateways/ethernet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'TestEthernet',
    versions: ['none']
  })
  });

  const data = await response.json();
  console.log(data);
};

async function connectGateway() {
  const response = await fetch('http://localhost:8000/api/gateways/ethernet/08e97b56-6f21-47cf-bf62-eca2302fa930', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    deviceID: '60c04eb9-58c6-40f8-8d58-14084324899f'
  })
  });

  const data = await response.json();
  console.log(data);
};

connectGateway()