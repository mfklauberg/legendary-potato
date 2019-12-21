import React, { FC, useRef } from 'react';

import './file-input.css';

import { Button } from '..';

interface Props {
  onChange: Function;
}

const FileInput: FC<Props> = (props) => {
  const { onChange } = props;

  const inputRef = useRef(null);

  const handleClick = () => {
    if (!inputRef || (inputRef && !inputRef.current)) {
      return;
    }

    const input = (inputRef.current as unknown) as HTMLInputElement;
    input.click();
  };

  const handleFile = (event: React.ChangeEvent) => {
    // @ts-ignore
    const file = event.target.files[0] as File;

    if (!file) {
      console.error('No file selected.');
    }

    const fileReader = new FileReader();

    fileReader.onload = function(event) {
      const content = event.target?.result;

      onChange({ content, name: file.name });
    };

    fileReader.readAsDataURL(file);
  };

  return (
    <div className='c-file-input'>
      <Button onClick={handleClick} value='Choose Image' />

      <input
        accept='image/*'
        className='c-file-input__input'
        onChange={handleFile}
        ref={inputRef}
        type='file'
      />
    </div>
  );
};

export default FileInput;
