import React from "react";
import { FileList, FileListItem, FileSelectorBody } from "./styles";
import { Controller } from "react-hook-form";

interface FileSelectorProps {
  name: string;
  multiple?: boolean;
  accept?: string;
  webkitdirectory?: boolean;
  required?: boolean
}

const FileInput: React.FC<FileSelectorProps> = ({ 
  name, 
  multiple, 
  accept, 
  webkitdirectory,
  required }) => {

  return (
    <Controller
      name={name}
      rules={{
        required
      }}
      render={({field:{value, onChange}}) => (

        <FileSelectorBody>
          <FileList>
            {value && value.map((file, index) => {
              return <FileListItem key={index}>
                <span>{file}</span>
              </FileListItem>
            })}
          </FileList>
          <input
            type="file"
            title={`Choose your ${webkitdirectory ? 'folder' : 'file'}${multiple ? 's' : ''}`}
            accept={accept}
            multiple={multiple}
            onChange={(e) => {
              const files = e.target.files;
              const value = Array.from(files ?? []).map((file) => (file as any).path)

              onChange(value);
            }}
            //@ts-ignore
            webkitdirectory={webkitdirectory ? String(webkitdirectory) : undefined}
          />
        </FileSelectorBody>
      )}
    />
  );
};

export default FileInput