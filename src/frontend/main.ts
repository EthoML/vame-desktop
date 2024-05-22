import * as commoners from "./commoners"
import * as defaults from './defaults'

import { showInConsole as showInDevConsole } from "./dev"; // Instantiate dev mode

import { get } from "./utils/requests";
import { app } from "./refs";
import Pipeline from "./Pipeline";
import Form from "./Form";


import { Logger } from "./Logger";
import defaultLogConfig from './utils/log'


const sections = {
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

          const files = ev.target.files;
          const projectPath = files.length > 0 ? files[0].path : null
          if (!projectPath) return reject()

          const pipeline = new Pipeline(projectPath)
          await pipeline.load()

          app.set(pipeline)

          resolve(projectPath)
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

const buttonRefs = Object.entries(sections).reduce((acc, [ section, config ]) => {
  const el = acc[section] = document.querySelector(`#${section}-button`)! as HTMLButtonElement
  el.onclick = config.onclick
  return acc
}, {})

const sectionRefs = Object.keys(sections).reduce((acc, section) => {
  const el = document.querySelector(`#${section}`) as HTMLDivElement
  if (el) acc[section] = el
  return acc
}, {}) as Record<keyof sections, HTMLDivElement>


const consoleElement = sectionRefs.edit.querySelector('.console')!;

const showInConsole = (html: string) => {
  const message = document.createElement('div');
  message.innerHTML = html;
  consoleElement.append(message);
  consoleElement.scrollTop = consoleElement.scrollHeight;
}

app.logger = new Logger(defaultLogConfig)
app.logger.console = {
  log: showInConsole,
  error: showInConsole,
  warn: showInConsole
}



const open = (section: string) => {
  const toOpen = sectionRefs[section]

  if (!toOpen) return

  Object.entries(sectionRefs).forEach(([ key, value ]) => {
    if (key === section) value.removeAttribute('hidden')
    else value.setAttribute('hidden', '')
  })
}

open("edit")


// --------------------------------------------------------- Button Callbacks ---------------------------------------------------------
const createProjectButton = document.querySelector("#create-project")!
createProjectButton.onclick = async (ev) => {
  ev.preventDefault()
  const form = new Form(sectionRefs.create.querySelector('form')!)
  const pipeline = new Pipeline()
  const formData = form.export()
  await pipeline.create(formData)
  app.set(pipeline)
  open("edit")
}

const runPipelineButton = document.querySelector("#run-pipeline")!
runPipelineButton.setAttribute('disabled', '')

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
  .then(() => {
    runPipelineButton.removeAttribute('disabled')
    showInDevConsole(`VAME is ready!`)
  })
  .catch(() => showInDevConsole(`Failed to connect to VAME`))
})

commoners.onClosed(() => showInDevConsole(`Python server was closed!`))

 