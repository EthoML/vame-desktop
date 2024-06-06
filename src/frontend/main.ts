import * as commoners from "./commoners"
import * as defaults from './defaults'

import { showInConsole as showInDevConsole } from "./dev"; // Instantiate dev mode

import { get } from "./utils/requests";
import { app } from "./refs";
import Pipeline from "./Pipeline";
import Form from "./Form";


import { Logger } from "./Logger";
import defaultLogConfig from './utils/handlers'
import { sections, sectionButtons, createProjectButton, runPipelineButton, mainConsoleElement } from "./elements";


const sectionConfigurations = {
  edit: {
    onclick: () => open("edit")
  },

  load: {

    onclick: async () => {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.webkitdirectory = true
      fileInput.click()

      const promise = new Promise((resolve, reject) => {

        fileInput.onchange = async (ev) => {

          const files = Array.from(ev.target.files);
          const configPath = files.length > 0 ? files.find(file => file.name === 'config.yaml')?.path : null
          if (!configPath) return reject()

          const pipeline = new Pipeline(configPath)
          await pipeline.load()

          mainConsoleElement.innerHTML = '' // Clear the console
          app.set(pipeline)

          resolve(configPath)
        }
      })

      await promise

      open("edit")
    }
  },

  create: {
    onclick: async () => {
      open("create")
    }
  },
  
  dev: {
    onclick: () => open("dev")
  },
}

Object.entries(sectionConfigurations).forEach(([ key, value ]) => {
  sectionButtons[key].onclick = value.onclick
})

const showInConsole = (html: string) => {
  const message = document.createElement('div');
  message.innerHTML = html;
  mainConsoleElement.append(message);
  mainConsoleElement.scrollTop = mainConsoleElement.scrollHeight;
}

app.logger = new Logger(defaultLogConfig)
app.logger.console = {
  log: showInConsole,
  error: showInConsole,
  warn: showInConsole
}



const open = (section: string) => {
  const toOpen = sections[section]

  if (!toOpen) return

  Object.entries(sections).forEach(([ key, value ]) => {
    if (key === section) value.removeAttribute('hidden')
    else value.setAttribute('hidden', '')
  })
}

open("edit")


// --------------------------------------------------------- Button Callbacks ---------------------------------------------------------
createProjectButton.onclick = async (ev) => {
  ev.preventDefault()
  const form = new Form(sections.create.querySelector('form')!)
  const pipeline = new Pipeline()
  const formData = form.export()
  await pipeline.create(formData)
  app.set(pipeline)
  mainConsoleElement.innerHTML = '' // Clear the console
  open("edit")
}

runPipelineButton.onclick = async () => {
  runPipelineButton.setAttribute('disabled', '')
  await app.run({
    align: { pose_ref_index: defaults.pose_ref_index },
    create_trainset: { pose_ref_index: defaults.pose_ref_index },
    gif: { pose_ref_index: defaults.pose_ref_index }
  }).catch(e => {
    console.error(e)
    showInConsole(`<small>${e}</small>`)
  })
  runPipelineButton.removeAttribute('disabled')
}

// ---------------------------------------------------------
// ---------------- Custom Commoners Callbacks -------------
// ---------------------------------------------------------

commoners.onActivityDetected(() => {
  showInDevConsole(`Checking Python server status...`)
  get('connected')
  .catch(() => showInDevConsole(`Python server is not active...`))
})

commoners.onConnected(() => {

  showInDevConsole(`Loading VAME library..`)

  get('ready')
  .then(() => showInDevConsole(`VAME is ready!`))
  .catch(() => showInDevConsole(`Failed to connect to VAME`))
})

commoners.onClosed(() => showInDevConsole(`Python server was closed!`))

 