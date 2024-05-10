
const main = document.querySelector('main')!;
const buttons = document.getElementById('buttons')!;
const consoleElement = document.getElementById('console')!;

const exampleDataFolder = "/Users/garrettflynn/Documents/GitHub/vame-desktop/data"

const projectName = 'Example-VAME-Project'
const workingDirectory = '/Users/garrettflynn/vame-desktop'

const date = new Date();
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formattedDate = monthNames[date.getMonth()] + (date.getDate()) + '-' + date.getFullYear();


const categoryLabels = {
  default: 'Core VAME Commands',
  custom: 'Custom Endpoints',
  optional: 'Additional Commands'

}

const config = {
  project: projectName, 
  videos: [ `${exampleDataFolder}/video-1.mp4` ], 
  working_directory: workingDirectory, 
  poses_estimations: [`${exampleDataFolder}/video-1.csv`],
  videotype: 'mp4',
}

const pose_ref_index = [ 0, 5 ]

const projectPath = `${workingDirectory}/${projectName}-${formattedDate}`

const endpoints = {
  initialize: {
     payload: config,
     onRequest: () => display(`Initializing VAME project...`),
     onSuccess: ({ project, created }) => {
        if (created) display(`New project created at ${project}`)
        else display(`Project already created`)
      }
      
  },
  configure: {
    label: "Configure for Test",
    category: 'custom',
    payload: { 
      project: projectPath, 
      config: {
        egocentric_data: true,
        max_epochs: 5
      } 
    },
    onRequest: () => display(`Setting as egocentric data and limiting epochs to 5...`),
    onSuccess: () => display(`Configuration updated!`),
  },
  align: {
    payload: { project: projectPath, pose_ref_index },
    onRequest: () => display(`Aligning data egocentrically...`),
    onSuccess: () => display(`Data has been aligned!`),
  },
  create: {
    payload: { project: projectPath, check_parameter: false, pose_ref_index },
    onRequest: () => display(`Creating trainset...`),
    onSuccess: () => display(`Trainset created!`),
  },
  train: {
    payload: { project: projectPath },
    onRequest: () => display(`Training model...`),
    onSuccess: () => display(`Model trained!`),
  },
  evaluate: {
    tags: [ 'failing' ],
    payload: { project: projectPath },
    onRequest: () => display(`Evaluating model...`),
    onSuccess: () => display(`Model evaluated!`),
  },
  segment: {
    tags: [ 'failing' ],
    payload: { project: projectPath },
    onRequest: () => display(`Running pose segmentation...`),
    onSuccess: () => display(`Pose segmentation finished!`),
  },
  delete_project: {
    category: 'custom',
    payload: { project: projectPath },
    onRequest: () => {},
    onSuccess: ({ deleted }) => {
      if (deleted) display(`Project deleted`)
      else display(`Project already does not exist`)
    }
  },
  motif_videos: {
    category: 'optional',
    tags: [ 'failing' ],
    payload: { 
      project: projectPath,
      videoType: '.mp4'
    }
  },
  community: {
    category: 'optional',
    tags: [ 'failing' ],
    payload: { 
      project: projectPath,
      show_umap: false,
      cut_tree: 2 
    }
  },
  community_videos: {
    category: 'optional',
    tags: [ 'failing' ],
    payload: { project: projectPath }
  },
  visualization: {
    category: 'optional',
    tags: [ 'failing' ],
    payload: { 
      project: projectPath,
      label: null // "motif", "community"
    }
  },
  generative_model: {
    category: 'optional',
    tags: [ 'failing' ],
    payload: { 
      project: projectPath,
      mode: 'centers' // "sampling", "reconstruction", "centers", "motifs"
    }
  },
  gif: {
    category: 'optional',
    tags: [ 'failing' ],
    payload: { 
      project: projectPath,
      pose_ref_index,
      subtract_background: true,
      start: null,
      length: 500,
      max_lag: 30,
      label: 'community',
      file_format: '.mp4',
      crop_size: [ 300, 300 ] 
    }
  }
} 

// # # OPTIONAL: Create motif videos to get insights about the fine grained poses
// # vame.motif_videos(config, videoType='.mp4')

// # # OPTIONAL: Create behavioural hierarchies via community detection
// # vame.community(config, show_umap=False, cut_tree=2)

// # # OPTIONAL: Create community videos to get insights about behavior on a hierarchical scale
// # vame.community_videos(config)

// # # OPTIONAL: Down projection of latent vectors and visualization via UMAP
// # vame.visualization(config, label=None) #options: label: None, "motif", "community"

// # # OPTIONAL: Use the generative model (reconstruction decoder) to sample from
// # # the learned data distribution, reconstruct random real samples or visualize
// # # the cluster center for validation
// # vame.generative_model(config, mode="centers") #options: mode: "sampling", "reconstruction", "centers", "motifs"

// # # OPTIONAL: Create a video of an egocentrically aligned mouse + path through
// # # the community space (similar to our gif on github) to learn more about your representation
// # # and have something cool to show around ;)
// # # Note: This function is currently very slow. Once the frames are saved you can create a video
// # # or gif via e.g. ImageJ or other tools
// # vame.gif(config, pose_ref_index=[0,5], subtract_background=True, start=None,
// #          length=500, max_lag=30, label='community', file_format='.mp4', crop_size=(300,300))



const header = (text: string) => {
  return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const display = (html: string) => {
  const message = document.createElement('div');
  message.innerHTML = html;
  consoleElement.append(message);
  consoleElement.scrollTop = consoleElement.scrollHeight;
}

const service = commoners.services.vame
if (service) {

  const pythonUrl = new URL(service.url)

  const onConnected = () => {

    const containers: { [x: string]: HTMLDivElement } = { }

    const requestButtons = Object.entries(endpoints).map(([ pathname, info ]) => {

      const payload = info.payload;

      const button = document.createElement('button');
      button.setAttribute('disabled', '');

      const label = info.label || pathname;
      const headerName = header(label);

      const tags = info.tags || []
      tags.forEach(tag => button.classList.add(tag))

      button.innerText = headerName;

      button.onclick = async () => {

        requestButtons.forEach(button => button.setAttribute('disabled', ''));

        info.onRequest ? info.onRequest() : display(`Sending ${headerName} request...`);

        await fetch(new URL(pathname, pythonUrl), {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        .then(async res => {
          const json  = await res.json()
          if (!res.ok) throw new Error(json.message)
          return json
        })

        .then(data => {
          console.warn(data)
          info.onSuccess ? info.onSuccess(data) : display(`${headerName} completed`)
        })

        .catch((e) => {
          info.onFailure ? info.onFailure(e) : display(`<small>${e}</small>`)
        })

        requestButtons.forEach(button => button.removeAttribute('disabled'));

      }

      const category = info.category || 'default'
      if (!containers[category]) {
        const container = containers[category] = document.createElement('div')
        container.classList.add('category')

        const label = categoryLabels[category] || category
        container.innerHTML = `<h2>${header(label)}</h2>`
        const buttons = document.createElement('div')
        buttons.classList.add('buttons')
        container.append(buttons)
        container.buttons = buttons
      }

      containers[category].buttons.append(button)

      return button

    })

    buttons.append(...Object.values(containers).flat())

    display('Loading VAME library...')
    fetch(new URL('preload', pythonUrl))
    .then(() => {
      display('VAME is ready!')
      requestButtons.forEach(button => button.removeAttribute('disabled'))
    })
    .catch(() => display('<small>Failed to preload VAME<small>'))


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

 