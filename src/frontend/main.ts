
const main = document.querySelector('main')!;

const button = document.querySelector('button')!;

button.setAttribute('disabled', '');

const config = {
  project: 'My-VAME-Project', 
  videos: ['/directory/to/your/video-1','/directory/to/your/video-2'], 
  working_directory: '/Users/garrettflynn/vame-desktop', 
  videotype: '.mp4'
}


const display = (html: string) => {
  main.innerHTML += `<div>${html}</div>`;
}

const service = commoners.services.vame
if (service) {

  const pythonUrl = new URL(service.url)

  const runCommands = async () => {
      fetch(new URL('connected', pythonUrl))
      .then(res => res.json())
      .then(() => {
        display('Python server is connected!')
        button.removeAttribute('disabled');
        button.addEventListener('click', () => {
          fetch(new URL('initialize', pythonUrl), {
            method: 'POST',
            body: JSON.stringify(config),
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(res => res.json())
          .then(data => {
            display(`Response: ${JSON.stringify(data)}`)
          })
          .catch(() => display(`Failed to initialize VAME project`))
        });
      })
      .catch(() => display(`Python server is not active...`))
  }

  if (commoners.target === 'desktop'){
    service.onActivityDetected(runCommands)

    service.onClosed(() => {
      display(`Python server was closed!`)
    })
  } 
  
  else runCommands()
}

 