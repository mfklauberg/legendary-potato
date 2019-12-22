import React, { ChangeEvent, Component, ReactElement, createRef } from 'react';
import { fabric } from 'fabric';

import './image-editor.css';

import { Button } from '..';

interface Props {
  name: string;
  src: string;
};

interface State {
  blurStrength: number;
  pixelizationStrength: number;
  saturationStrength: number;
  sepiaStrength: number;
  vintageStrength: number;
  [key: string]: any;
}


function dataToBlob(data: string): Blob {
  const [partA, partB] = data.split(',');

  const byteString = atob(partB);
  const mimeString = partA.split(':')[1].split(';')[0];

  const buffer = new ArrayBuffer(byteString.length);
  const integerArray = new Uint8Array(buffer);

  for (let i = 0; i < byteString.length; i++) {
    integerArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([buffer], { type: mimeString });
}

class ImageEditor extends Component<Props, State> {
  private canvas!: fabric.Canvas;
  private canvasRef = createRef<HTMLCanvasElement>();

  private objectScale = .25;

  state = {
    blurStrength: 0,
    pixelizationStrength: 0,
    saturationStrength: 0,
    sepiaStrength: 1,
    vintageStrength: 1
  };

  componentDidMount(): void {
    const canvasElement = this.canvasRef.current as unknown as HTMLCanvasElement;

    fabric.textureSize = 4096;

    this.canvas = new fabric.Canvas(canvasElement);
  }

  shouldComponentUpdate(prevProps: Props, prevState: State): boolean {
    const { src } = this.props;
    const { blurStrength, pixelizationStrength, saturationStrength, sepiaStrength, vintageStrength } = this.state;

    if (blurStrength !== prevState.blurStrength) return true;
    if (pixelizationStrength !== prevState.pixelizationStrength) return true;
    if (saturationStrength !== prevState.saturationStrength) return true;
    if (sepiaStrength !== prevState.sepiaStrength) return true;
    if (vintageStrength !== prevState.vintageStrength) return true;

    return prevProps.src !== src;
  }

  componentDidUpdate(prevProps: Props): void {
    const { src } = this.props;

    if (prevProps.src === src) {
      return;
    }

    this.canvas.clear();

    fabric.Image.fromURL(src, (image) => {
      const obj = image
        .set({ left: 0, top: 0 })
        .scale(this.objectScale);

      this.lockObjectMovement(obj);

      this.canvas.add(obj);
      this.canvas.setActiveObject(obj);

      this.scaleCanvas(image.height as number, image.width as number, this.objectScale);
    });
  }

  lockObjectMovement = (obj: fabric.Object): void => {
    obj.lockMovementX = true;
    obj.lockMovementY = true;
    obj.lockRotation = true;
    obj.lockScalingFlip = true;
    obj.lockScalingX = true;
    obj.lockScalingY = true;
    obj.lockSkewingX = true;
    obj.lockSkewingY = true;
    obj.lockUniScaling = true;
  };

  scaleCanvas = (height: number, width: number, scale: number): void => {
    this.canvas.setHeight(height * scale);
    this.canvas.setWidth(width * scale);
  }

  clearImageFilters = (image: fabric.Image): void => {
    image.filters = [];
  };

  getImage = (): fabric.Image => {
    return this.canvas.getActiveObject() as fabric.Image;
  };

  onDownloadClick = (): void => {
    const { name } = this.props;

    const [filename, fileformat] = name.split('.');

    const dataFormat = `image/${fileformat}`;

    const image = this.getImage();
    const height = image.height as number;
    const width = image.width as number;

    image.scale(1);
    this.scaleCanvas(height, width, 1);

    const data = this.canvas
      .toDataURL({ format: dataFormat, multiplier: 1 });

    const blob = dataToBlob(data);

    const link = document.createElement('a');
    link.download = `${filename}-${new Date().toISOString()}.${fileformat}`;
    link.href = URL.createObjectURL(blob);
    link.onclick = () => {
      requestAnimationFrame(() => {
        image.scale(this.objectScale);
        this.scaleCanvas(height, width, this.objectScale)
        URL.revokeObjectURL(link.href);
      });
    };

    link.click();
  };

  onRemoveFiltersClick = (): void => {
    const image = this.getImage();
    this.clearImageFilters(image);

    image.applyFilters();
    this.canvas.renderAll();
  };

  onChangeStrength = (property: string) => {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      const value = Number(event.target.value);

      this.setState({ [property]: value });
    };
  };

  applyFilter = (filter: fabric.IBaseFilter): void => {
    const image = this.getImage();
    this.clearImageFilters(image);

    image.filters?.push(filter);
    image.applyFilters();

    this.canvas.renderAll();
  };

  onBlurClick = (): void => {
    const { blurStrength } = this.state;

    // @ts-ignore - missing Blur filter annotation
    const filter = new fabric.Image.filters.Blur({
      blur: blurStrength
    });

    this.applyFilter(filter);
  };

  onSepiaClick = (): void => {
    const { sepiaStrength: strength } = this.state;

    // There's a Sepia filter built in the Fabric library, but to control its strength, we have to
    // use a ColorMatrix with the original matrix values multiplied by the strength varying 1 to n.
    const filter = new fabric.Image.filters.ColorMatrix({
      matrix: [
        0.393 * strength, 0.769 * strength, 0.189 * strength, 0, 0,
        0.349 * strength, 0.686 * strength, 0.168 * strength, 0, 0,
        0.272 * strength, 0.534 * strength, 0.131 * strength, 0, 0,
        0, 0, 0, 1, 0
      ]
    });

    this.applyFilter(filter);
  };

  onVintageClick = (): void => {
    const { vintageStrength: strength } = this.state;

    // There's a Vintage filter built in the Fabric library, but to control its strength, we have to
    // use a ColorMatrix with the original matrix values multiplied by the strength varying 1 to n.
    const filter = new fabric.Image.filters.ColorMatrix({
      matrix: [
        0.62793 * strength, 0.32021 * strength , -0.03965 * strength, 0, 0.03784 * strength,
        0.02578 * strength, 0.64411 * strength , 0.03259 * strength , 0, 0.02926 * strength,
        0.04660 * strength, -0.08512 * strength, 0.52416 * strength , 0, 0.02023 * strength,
        0, 0, 0, 1, 0
      ],
    });

    this.applyFilter(filter);
  };

  onPixelizationClick = (): void => {
    const { pixelizationStrength } = this.state;

    const filter = new fabric.Image.filters.Pixelate({
      blocksize: pixelizationStrength
    });

    this.applyFilter(filter);
  };

  onSaturationClick = (): void => {
    const { saturationStrength } = this.state;

    const filter = new fabric.Image.filters.Saturation({
      saturation: saturationStrength
    });

    this.applyFilter(filter);
  };

  onBlackAndWhiteClick = (): void => {
    // @ts-ignore - missing BlackWhite filter annotation
    const filter = new fabric.Image.filters.BlackWhite();

    this.applyFilter(filter);
  };

  renderControls(): null | ReactElement {
    const { src } = this.props;
    const { blurStrength, pixelizationStrength, saturationStrength, sepiaStrength, vintageStrength } = this.state;

    if (!src) {
      return null;
    }

    return (
      <div className="c-image-editor__controls">
        <Button onClick={this.onDownloadClick} value="Download" />
        <Button onClick={this.onRemoveFiltersClick} value="Remove Filters" />

        <span className="c-image-editor__label">Filters:</span>

        <div className="c-image-editor__controls-item">
          <input type="range" value={blurStrength} min="0" max="1" step="0.1" onChange={this.onChangeStrength('blurStrength')} />
          <Button onClick={this.onBlurClick} value="Apply Blur" />
        </div>

        <div className="c-image-editor__controls-item">
          <input type="range" value={sepiaStrength} min="1" max="2" step="0.1" onChange={this.onChangeStrength('sepiaStrength')} />
          <Button onClick={this.onSepiaClick} value="Apply Sepia" />
        </div>

        <div className="c-image-editor__controls-item">
          <input type="range" value={vintageStrength} min="1" max="2" step="0.1" onChange={this.onChangeStrength('vintageStrength')} />
          <Button onClick={this.onVintageClick} value="Apply Vintage" />
        </div>

        <div className="c-image-editor__controls-item">
          <input type="range" value={pixelizationStrength} min="0" max="50" step="1" onChange={this.onChangeStrength('pixelizationStrength')} />
          <Button onClick={this.onPixelizationClick} value="Apply Pixelization" />
        </div>

        <div className="c-image-editor__controls-item">
          <input type="range" value={saturationStrength} min="0" max="1" step="0.1" onChange={this.onChangeStrength('saturationStrength')} />
          <Button onClick={this.onSaturationClick} value="Apply Saturation" />
        </div>

        <div className="c-image-editor__controls-item">
          <Button onClick={this.onBlackAndWhiteClick} value="Apply Black and White" />
        </div>
      </div>
    );
  }

  render(): ReactElement {
    const { name } = this.props;

    return (
      <div className='c-image-editor'>
        {name && <span className='c-image-editor__file'>Editing: {name}</span>}

        <div className='c-image-editor__content'>
          {this.renderControls()}

          <div className='c-image-editor__canvas'>
            <canvas className='c-editor-canvas' ref={this.canvasRef} />
          </div>
        </div>
      </div>
    );
  }
}

export default ImageEditor;