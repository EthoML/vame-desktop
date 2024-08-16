import csv

def get_pose_ref_index_description(csv_file_path: str) -> str:
    with open(csv_file_path) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        body_parts = []

        # loop to iterate through the rows of csv
        for row in csv_reader:
            if row[0] == "bodyparts":
                body_parts = list(dict.fromkeys(row[1:]))  # Extract body parts starting from the second element and remove duplicates
                break

        if len(body_parts) == 0:
            print("No body parts headers found in CSV.")
            return ""

        # Create the string based on body parts
        body_parts_string = ", ".join([f"{i}-{part}" for i, part in enumerate(body_parts)])

    return body_parts_string, len(body_parts) - 1 if body_parts else None;

