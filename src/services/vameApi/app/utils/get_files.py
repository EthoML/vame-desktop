from pathlib import Path

FILES_TO_IGNORE = [ '.DS_Store' ]

def get_files(folder_to_search):
    folder_to_search = Path(folder_to_search)
    ignore_glob = set(FILES_TO_IGNORE)
    return [ file for file in folder_to_search.glob('*') if file.is_file() and file.name not in ignore_glob ]