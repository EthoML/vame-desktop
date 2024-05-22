
import App from "./App";
import Pipeline from "./Pipeline";
import { onReady } from "./commoners";
import demoInputs from "./demo/inputs.json";
import demoSteps from "./demo/steps.json";

const lastPipeline = localStorage.getItem('pipeline')

const app = new App()
const pipeline = lastPipeline ? new Pipeline(lastPipeline) : new Pipeline()

    onReady(async () => {

        const willCreate = lastPipeline ? (await pipeline.load()).config === null : true // Load last pipeline if it exists

        // Create a new pipeline if no pipeline is found
        if (willCreate) await pipeline.create(demoInputs) 
            
        // Set loaded pipeline on the app
        app.set(pipeline)

    })

export {
    app
}