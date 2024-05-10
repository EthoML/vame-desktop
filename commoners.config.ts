
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
            src: './src/services/python/main.py',
            publish: {
                build: 'python -m PyInstaller --name vame --onedir --clean ./src/services/vame/main.py --distpath ./build/vame',
                local: {
                    src: 'flask',
                    base: './build/vame/flask', // Will be copied
                }
            }
        }
    }
})