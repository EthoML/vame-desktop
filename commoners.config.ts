import * as logForwardingPlugin from './src/plugins/log-forwarding'

const defineConfig = (o) => o 

const serviceName = 'vame'
const serviceBuildRoot = `./build/python`
const pythonSrc = './src/backend/app.py'

export default defineConfig({

    name: "VAME",
    target: 'desktop',
    appId: 'com.gladstoneinstitutes.vame',

    plugins: {
        log: logForwardingPlugin
    },
    
    icon: './logo.png', 

    electron: {
        window: {
            width: 1200, // Adjust default width
            height: 800, // Adjust default height
            minHeight: 600, // Adjust minimum height
        }
    },

    services: {

        // Packaged with pyinstaller
        [serviceName]: {
            description: 'A simple Python service for VAME',
            src: pythonSrc,
            publish: {
                build: `python -m PyInstaller --name ${serviceName} --onedir --clean ${pythonSrc} -y --distpath ${serviceBuildRoot} --collect-all=numpy.core`,
                local: {
                    src: serviceName,
                    base: `${serviceBuildRoot}/${serviceName}`, // Will be copied
                }
            }
        }
        
    }
})