
const main = document.querySelector('main')!;
const buttons = document.getElementById('buttons')!;
const consoleElement = document.getElementById('console')!;

const exampleDataFolder = "/Users/garrettflynn/Documents/GitHub/vame-desktop/data"

const projectName = 'Example-VAME-Project'
const workingDirectory = '/Users/garrettflynn/vame-desktop'

const date = new Date();
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formattedDate = monthNames[date.getMonth()] + (date.getDate()) + '-' + date.getFullYear();


const config = {
  project: projectName, 
  videos: [ `${exampleDataFolder}/video1` ], 
  working_directory: workingDirectory, 
  videotype: '.mp4'
}

const configPath = `${workingDirectory}/${projectName}-${formattedDate}/config.yaml`

const endpoints = {
  initialize: {
     payload: config,
     onSuccess: data => {
        if (data === null) display(`Project already created`)
        else display(`New project created at ${data}`)
      },
      onFailure: () => display(`Failed to initialize VAME project`)
      
  },
  align: {
    payload: { config: configPath, pose_ref_index: [0,5] }
  },
  create: {
    payload: { config: configPath }
  },
  train: {
    payload: { config: configPath, check_parameter: false }
  },
  evaluate: {
    payload: { config: configPath }
  },
  segment: {
    payload: { config: configPath }
  }
} 


const header = (text: string) => text[0].toUpperCase() + text.slice(1)

const display = (html: string) => {
  const message = document.createElement('div');
  message.innerHTML = html;
  consoleElement.append(message);
}

const service = commoners.services.vame
if (service) {

  const pythonUrl = new URL(service.url)

  const onConnected = () => {

    const requestButtons = Object.entries(endpoints).map(([name, info]) => {

      const payload = info.payload;

      const button = document.createElement('button');

      const headerName = header(name);

      button.innerText = headerName;

      button.onclick = () => {

        button.setAttribute('disabled', '');

        console.log(`Sending request to ${headerName}...`)

        fetch(new URL(name, pythonUrl), {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        .then(res => res.json())

        .then(data => info.onSuccess ? info.onSuccess(data) : display(`${headerName} completed`))

        .catch((e) => info.onFailure ? info.onFailure(e) : display(`${headerName} failed`))

        button.removeAttribute('disabled');

      }

      return button

    })

    buttons.append(...requestButtons)

  }

  const onServerStart = async () => {
      return fetch(new URL('connected', pythonUrl))
      .then(res => res.json())
      .then(onConnected)
      .catch(() => display(`Python server is not active...`))
  }

  if (commoners.target === 'desktop'){
    service.onActivityDetected(onServerStart)

    service.onClosed(() => {
      display(`Python server was closed!`)
    })
  } 
  
  else onServerStart()
}

 