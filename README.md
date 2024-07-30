# VAME Desktop
A desktop application for the Variational Animal Motion Encoding (VAME) project.

## Overview
VAME Desktop has been designed to run each step of a VAME project **only once**. This is to ensure that the project is reproducible and that the data is not accidentally overwritten.

## Installation

### Download builded versions:

You can find the builed versions of VAME Desktop on the [release page](https://github.com/catalystneuro/vame-desktop/releases).

## Development mode

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

## Deploy 

The deploy will be trigger every time a new push is maded to the `main` branch with a tag associated, creating a release at [release page](https://github.com/catalystneuro/vame-desktop/releases).

To avoid unecessary deploys, create a branch `git checkout -b <branch_name>`, work on it, and create a pull request once the job is done.

Then create a new tag with `git tag v<tag_number>`, push it to the repo with `git push orgin --tags`.

Then merge the PR into main. The github actions will create a [Draft Release](https://github.com/catalystneuro/vame-desktop/releases) where you can put some infos about it, and finaly approve and publish. 

