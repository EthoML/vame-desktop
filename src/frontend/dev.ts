import Pipeline from "./Pipeline";
import { onConnected, onReady } from "./commoners";
import { header } from "./utils/text";

import log from "./utils/log";

import { app } from "./refs";

const defaultConfigOptions = {
    egocentric_data: true,
    max_epochs: 5
}

const defaultPoseRefIndex = [ 0, 5 ]

const categoryLabels = {
    default: 'Core VAME Commands',
    custom: 'Custom Endpoints',
    optional: 'Additional Commands'
}

const buttons = document.getElementById('buttons')!;
const consoleElement = document.getElementById('console')!;


export const showInConsole = (html: string) => {
    const message = document.createElement('div');
    message.innerHTML = html;
    consoleElement.append(message);
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

const pipelineMethods = {
  load: {
    ...log.load
 },
  configure: {
    label: "Configure for Test",
    category: 'custom',
    payload: defaultConfigOptions,
    ...log.configure
  },
  align: {
    payload: { pose_ref_index: defaultPoseRefIndex },
    ...log.align
  },
  create_trainset: {
    payload: { pose_ref_index: defaultPoseRefIndex },
    ...log.create_trainset
  },
  train: {
    ...log.train
  },
  evaluate: {
    tags: [ 'failing' ],
    ...log.evaluate
  },
  segment: {
    tags: [ 'failing' ],
    ...log.segment
  },
  delete: {
    category: 'custom',
    ...log.delete
  },
  motif_videos: {
    category: 'optional',
    tags: [ 'failing' ]
  },
  community: {
    category: 'optional',
    tags: [ 'failing' ]
  },
  community_videos: {
    category: 'optional',
    tags: [ 'failing' ],
  },
  visualization: {
    category: 'optional',
    tags: [ 'failing' ],
  },
  generative_model: {
    category: 'optional',
    tags: [ 'failing' ]
  },
  gif: {
    payload: { pose_ref_index: defaultPoseRefIndex },
    category: 'optional',
    tags: [ 'failing' ]
  }
}


onConnected(() => {

    const containers: { [x: string]: HTMLDivElement } = { }

    const requestButtons = Object.entries(pipelineMethods).map(([ method, info ]) => {

      const button = document.createElement('button');
      button.setAttribute('disabled', '');

      const label = info.label || method;
      const headerName = header(label);

      const tags = info.tags || []
      tags.forEach(tag => button.classList.add(tag))

      button.innerText = headerName;

      button.onclick = async () => {

        requestButtons.forEach(button => button.setAttribute('disabled', ''));

        info.onRequest ? info.onRequest() : showInConsole(`Sending ${headerName} request...`)

        const pipelineMethod = app.pipeline[method as keyof Pipeline] as Function

        const methodPromise = 'payload' in info ? pipelineMethod(info.payload) : pipelineMethod()

        await methodPromise
        .then((data) => info.onSuccess ? info.onSuccess(data) :showInConsole(`${headerName} completed`))
        .catch((e) => info.onFailure ? info.onFailure() : showInConsole(`<small>${e}</small>`))

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

    onReady(() => requestButtons.forEach(button => button.removeAttribute('disabled')))

    buttons.append(...Object.values(containers).flat())
  }

)