# VAME Desktop
A desktop application for the Variational Animal Motion Encoding (VAME) project.

> **NOTE:** Before you begin, make sure you [download the demo video](https://drive.google.com/file/d/1w6OW9cN_-S30B7rOANvSaR9c3O5KeF0c/view) to `data`.

## Development
### Installation
#### Python
Create the Conda environment for the project by running the following command:

```bash
conda env create -f environment.yml 
```

This will install all the necessary Python dependencies for the project!

To activate the environment, run the following command:
```bash
conda activate vame-desktop
```

#### [Node.js](https://nodejs.org/en)
Install Node.js and project dependencies by running the following command:
```bash
npm install
```

This only needs to be run once at project initialization and when the `package.json` dependencies are updated.

### Running the App
To run the app, you will need to run the following command:
```bash
npm run start
```

This will start the Electron app and open the main window.


## Important Design Decisions
1. External projects are symlinked to the `~/vame-desktop` directory, which allows for easy access to the data and models. However, nothing is done to handle when the symlink is broken.