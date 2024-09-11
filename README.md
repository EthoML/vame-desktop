# VAME Desktop
A desktop application for the Variational Animal Motion Encoding (VAME) project.

![VAME-Desktop](https://github.com/user-attachments/assets/1b834650-14f5-4dff-8ba0-b29f18178337)


## Overview
VAME Desktop has been designed to run each step of a VAME project **only once**. This is to ensure that the project is reproducible and that the data is not accidentally overwritten.

## Installation

### Requirement:

For some images functions (as UMAP images) [ffmpeg](https://www.ffmpeg.org/) is needed.

Download page: https://www.ffmpeg.org/download.html

### Download Desktop versions:

You can find installers for VAME Desktop on the [release page](https://github.com/catalystneuro/vame-desktop/releases).

#### MacOS
> For M-series Macs, download the -arm64.dmg. For Intel Macs, download the -x64.dmg.

Open the `vame-desktop-<VERSION>-macos-arm64.dmg` or `vame-desktop-<VERSION>-macos-x64.dmg`, and drag and drop the `VAME Desktop` into the `Applications` folder.

Then go to `Applications` in Finder.

![Finder](https://github.com/user-attachments/assets/87c1de95-0a61-455d-8582-71ed2958c649)

Hold `Control ^` on the keyboard, then click open. In the following window, click on open again. This process needs to be done once. After that, the app can be opened from Launchpad as usual.

#### Windows

Double-click on `vame-desktop-<VERSION>-win-setup.exe`. The app will be installed and a shortcut named `VAME Desktop` will be added to your Desktop. Double-click on it to launch the app.

#### Linux Debian

Double-click on `vame-desktop-<VERSION>-linux.deb` or

```sh
sudo dpkg -i vame-desktop-<VERSION>-linux.deb
```

The executable will be added to the main applications folder on your Linux distribution.

## Example data

The app can be tested on the sample input data found [here](https://ethoml.github.io/VAME/docs/getting_started/running/#1-download-the-necessary-resources).

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
python -m pip install -r requirements.txt
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

![Build diagram](https://private-user-images.githubusercontent.com/24541631/366426425-ee5c223b-e918-4863-befe-f4f2b92aede4.jpg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MjYwNTI2NDAsIm5iZiI6MTcyNjA1MjM0MCwicGF0aCI6Ii8yNDU0MTYzMS8zNjY0MjY0MjUtZWU1YzIyM2ItZTkxOC00ODYzLWJlZmUtZjRmMmI5MmFlZGU0LmpwZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA5MTElMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwOTExVDEwNTkwMFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTQyNTM2YjNiZDg0MjNiMTQwYTRlZTUyYTU1MDA4NmNkNzQ1NmJhZWUwZGZlMzNjZmFjNDc4M2JiMGI2MDQzYzYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.LYN0dHYhxAVjsjjAZbGLQDzDu-HBv7meNqlPODQewsc)

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

## Publish

Publishing will happen every time a new push is maded to the `main` branch with a tag associated, creating a release at [release page](https://github.com/catalystneuro/vame-desktop/releases).

To avoid unecessary releases, follow these steps:
- Create a branch `git checkout -b <branch_name>`, work on it, and create a pull request to `main`.
- Update the `package.json` with the new version number.
- Create a new tag with `git tag v<tag_number>`, push it to the repo with `git push orgin --tags`. **IMPORTANT**: the tag must be in the format `vX.Y.Z` where `X.Y.Z` is the package version number in `package.json`.
- Create a draft release on github using the tag created.
- Merge the PR from `<branch_name>` into `main`. The github action will publiss the executable assets to the draft release.
- Manually edit the draft release, add information about the new features, bug fixes, and breaking changes.
- Finaly approve and publish the new release.

