import json
import os
import signal

from app.config import VAME_PROJECTS_DIRECTORY,VAME_LOG_DIRECTORY,GLOBAL_SETTINGS_FILE, GLOBAL_STATES_FILE

from app import create_app

def signal_handler(sig, frame):
    print('Received SIGTERM, shutting down...')
    os._exit(0)

signal.signal(signal.SIGTERM, signal_handler)

app = create_app()

if __name__ == "__main__":
    env_port = os.getenv('PORT')
    PORT = int(env_port) if env_port else 8641
    HOST = os.getenv('HOST') or 'localhost'

    VAME_PROJECTS_DIRECTORY.mkdir(exist_ok=True, parents=True) # Create the VAME_PROJECTS_DIRECTORY if it doesn't exist
    VAME_LOG_DIRECTORY.mkdir(exist_ok=True, parents=True)  # Create the VAME_LOG_DIRECTORY if it doesn't exist

    # Create the global files if they don't exist
    global_files = [GLOBAL_STATES_FILE, GLOBAL_SETTINGS_FILE]
    for file in global_files:
        if not file.exists():
            with open(file, "w") as f:
                json.dump({}, f)

    try:
        print(f"Flask server started at {HOST}:{PORT}")
        app.run(host=HOST, port = PORT)

    except Exception as e:
        print(f"An error occurred that closed the server: {e}")
        raise e
