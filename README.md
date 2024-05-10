# VAME
A cross-platform app for the Variational Animal Motion Encoding (VAME) project.

> **NOTE:** Before you begin, make sure you [download the demo video](https://drive.google.com/file/d/1w6OW9cN_-S30B7rOANvSaR9c3O5KeF0c/view) to `data`.

### Scope
- [ ] Upgrade VAME to Python 3.10+
- [ ] Fix the issue with the `sklearn` package

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

#### Node.js
Install the necessary Node.js dependencies by running the following command:
```bash
npm install
```

### Running the App
To run the app, you will need to run the following command:
```bash
npm run start
```

This will start the Electron app and open the main window.
