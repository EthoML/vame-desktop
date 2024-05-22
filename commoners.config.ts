
const defineConfig = (o) => o 

export default defineConfig({

    name: "VAME",
    target: 'desktop',
    appId: 'com.gladstoneinstitutes.vame',
    
    
    icon: './logo.png', 

    electron: {
        splash: './splash.html',
        window: {
            width: 1200 // Adjust default width
        }
    },

    services: {

        // Packaged with pyinstaller
        vame: {
            description: 'A simple Python server',
            src: './src/services/vame/main.py',
            publish: {
                build: 'python -m PyInstaller --name vame --onedir --clean ./src/services/vame/main.py --distpath ./build/vame --collect-all torch --collect-all scipy --collect-all vame --hidden-import tensorflow --hidden-import pandas',
                local: {
                    src: 'vame',
                    base: './build/vame/vame', // Will be copied
                }
            }
        }
    }
})