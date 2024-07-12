# VAME Desktop
A desktop application for the Variational Animal Motion Encoding (VAME) project.

## Overview
VAME Desktop has been designed to run each step of a VAME project **only once**. This is to ensure that the project is reproducible and that the data is not accidentally overwritten.

## Installation
### Python
You will need to have [miniconda](https://docs.conda.io/en/latest/miniconda.html) installed on your machine OR [pyenv](https://github.com/pyenv/pyenv).

#### with pyenv:

```bash
pyenv local
```

```bash
python -m venv venv
```

Unix system (linux or macos):
```bash
source ./venv/bin/activate
```

Windows:
```sh
.\venv\Scripts\activate.bat
```

This will install all the necessary Python dependencies for the project.

```bash
python -m pip install -r requiremente.txt
```

#### with conda:
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
You will need to have [Node.js 20](https://nodejs.org/en/) installed on your machine.
You also can use [nvm](https://github.com/nvm-sh/nvm) or [n](https://github.com/tj/n) to select versions.

Install Node modules by running the following command:
```bash
npm install
```

This only needs to be run once at project initialization and when the `package.json` dependencies are updated.

## Running the App
To run the app, you will need to run the following command:
```bash
npm run dev
```

This will start the Electron app on developer mode.

## Build:

The build process will create a `.exe`, `.dmg` or `.deb` depend on OS. Run differents command on incompatible OS will result on error.

MacOS
```bash
npm run build:mac
```

Windows
```bash
npm run build:win
```

Linux Debian
```bash
npm run build:linux
```
