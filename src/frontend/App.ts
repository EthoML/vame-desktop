import Form from "./Form";
import { Logger } from "./Logger";
import Pipeline, { PipelineMethodOptions } from "./Pipeline";
import { runPipelineButton, sections } from "./elements";

const pipelineForm = sections.edit.querySelector('form')! as HTMLFormElement

const IMMUTABLE_CONFIGURATION_OPTIONS = [
  // "Project",
  "project_path", 
  "video_sets"
]

class App {

    pipeline?: Pipeline
    form = new Form(pipelineForm)

    logger?: Logger
  
    constructor() {

    }
  
    set(pipeline: Pipeline) {
      this.form.clear()
      this.pipeline = pipeline
      localStorage.setItem('pipeline', pipeline.path)

      const configuration = structuredClone(this.pipeline.configuration)
      if (!configuration) return

      IMMUTABLE_CONFIGURATION_OPTIONS.forEach(key => delete configuration[key])
      runPipelineButton.removeAttribute('disabled') // Enable the run button
      this.form.load(configuration)
    }

    run(inputs: PipelineMethodOptions = {}) {

      const configuration = this.form.export()
      console.log(configuration)

        
       return this.pipeline.run(
        inputs,
        configuration,
        this.logger
       )

    }
    
  }

  
export default App