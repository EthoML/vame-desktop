# VAME Desktop
A desktop application for the Variational Animal Motion Encoding (VAME) project.

> **Note:** VAME Desktop has been built on [commoners](http://github.com/neuralinterfaces/commoners) for distribution as a cross-platform desktop application. However, the project is still in development and is not yet ready for distribution. **You will need to follow the local installation instructions below to run the app.**

## Overview
VAME Desktop has been designed to run each step of a VAME project **only once**. This is to ensure that the project is reproducible and that the data is not accidentally overwritten.


## Installation
### Python
You will need to have [miniconda](https://docs.conda.io/en/latest/miniconda.html) installed on your machine.

Create the Conda environment for the project by running the following command:

```bash
conda env create -f environment.yml 
```
This will install all the necessary Python dependencies for the project.

Once complete, activate the environment by running the following command:
```bash
conda activate vame-desktop
```

### Node.js
You will need to have [Node.js](https://nodejs.org/en/) installed on your machine.

Install Node modules by running the following command:
```bash
npm install
```

This only needs to be run once at project initialization and when the `package.json` dependencies are updated.

## Running the App
To run the app, you will need to run the following command:
```bash
npm run start
```

This will start the Electron app.