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

## Final Updates
0. Number tabs
    - Model evaluation is Step 3b
1. Show the user the terminal output of the Python script.
    - As a request is happening, show the ongoing terminal output in a popup
2. Allow regeneration of reconstruction / future prediction plot without re-running
3. Commit to each step — As the user proceeds, all the fields go grey so they aren't editable
    - Also no redoing the same step
    - Allow forking through a button to avoid the creation step
4. Move create_trainset call to below Data Alignment
5. Combine train and evaluate
6. Allow video creation to only generate a subset of videos (and possibly motifs)
7. For the community function, change the `cut the Tree` input option to an argument

## Important Design Decisions
1. External projects are symlinked to the `~/vame-desktop` directory, which allows for easy access to the data and models. However, nothing is done to handle when the symlink is broken.

## Future Work
1. Use the schema to both generate the configuration file _and_ render the form. This will require adding back hidden fields (e.g. `all_data`)