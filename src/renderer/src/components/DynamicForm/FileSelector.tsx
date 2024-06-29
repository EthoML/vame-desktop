import { ChangeEvent, FC, useCallback } from "react";
import { FileList, FileListItem, FileSelectorBody } from "./styles";

interface FileSelectorProps {
  name: string;
  value: File[];
  onChange: (e: ChangeEvent<HTMLInputElement>, index?: number | null, arrayKey?: string | null) => void;
  multiple?: boolean;
  accept?: string;
  webkitdirectory?: string;
}

const FileSelector: FC<FileSelectorProps> = ({ name, value, onChange, multiple, accept, webkitdirectory }) => {

  const getFilePath = useCallback((file: any) => file.path ?? file, [])

  // Ensure value is an array
  value = value !== undefined ? (Array.isArray(value) ? value : [value]) : value

  return (

    <FileSelectorBody>
      <FileList>
        {value && value.map((file, index) => {
          const label = getFilePath(file);

          return <FileListItem key={index}>
            <span>{label}</span>
          </FileListItem>
        })}
      </FileList>
      <input
        type="file"
        title={`Choose your ${webkitdirectory ? 'folder' : 'file'}${multiple ? 's' : ''}`}
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={(e) => onChange(e)}
        webkitdirectory={webkitdirectory}
      />
    </FileSelectorBody>
  );
};

export default FileSelector