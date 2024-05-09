# VAME
A cross-platform app for the Variational Animal Motion Encoding (VAME) project.

### Scope
- [ ] Upgrade VAME to Python 3.10+
- [ ] Fix the issue with the `sklearn` package

## Development
### Installation
#### Python
Create a new Conda environment and activate it:

```bash
conda create --name vame-desktop python=3.9
conda activate vame-desktop
```

Install [python-dotenv](https://pypi.org/project/python-dotenv/) to allow for configuring the environment to avoid an issue with the use of `sklearn`.
```bash
pip install "python-dotenv[cli]"
```

Then run the following command to install the necessary dependencies:
```bash
dotenv run -- conda env update --file environment.yml --prune
```

This will install all the necessary Python dependencies for the project!

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