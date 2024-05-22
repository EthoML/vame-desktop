
import App from "./App";
import Pipeline from "./Pipeline";
import { onReady } from "./commoners";

const lastPipelinePath = localStorage.getItem('pipeline')

const app = new App()

onReady(async () => {

    if (lastPipelinePath) {
        const pipeline = new Pipeline(lastPipelinePath) 
        await pipeline.load() // Load pipeline
        app.set(pipeline) // Set loaded pipeline on the app
    }

})

export {
    app
}