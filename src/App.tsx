import React, { useState } from 'react';
import './App.css';

import { FileInput, ImageEditor } from './components';

const App: React.FC = () => {
  const [imageData, setImageData] = useState({});

  // @ts-ignore
  const { content, name } = imageData;

  return (
    <div className="l-app">
      <div className="l-app__title">
        Image Filter Application
      </div>
      <div className="l-app__content">
        <FileInput onChange={setImageData} />
        <ImageEditor name={name} src={content} />
      </div>
    </div>
  );
}

export default App;
