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
  sepiaStrength: number;
  vintageStrength: number;
  [key: string]: any;
}

class ImageEditor extends Component<Props, State> {
  private canvas!: fabric.Canvas;
  private canvasRef = createRef<HTMLCanvasElement>();

  private objectScale = .25;

  state = {
    blurStrength: 0,
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
    const { blurStrength, sepiaStrength, vintageStrength} = this.state;

    if (blurStrength !== prevState.blurStrength) return true;
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
      this.canvas.setHeight((image.height || 0) * this.objectScale);
      this.canvas.setWidth((image.width || 0) * this.objectScale);
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

    const data = this.canvas
      .toDataURL({ format: dataFormat, multiplier: 1 })
      .replace(dataFormat, 'image-octet-stream');

    const link = document.createElement('a');
    link.download = `${filename}-${new Date().toISOString()}.${fileformat}`;
    link.href = data;
    link.click();
  };

  onChangeStrength = (property: string) => {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      const value = Number(event.target.value);

      this.setState({ [property]: value });
    };
  };

  onBlurClick = (): void => {
    const { blurStrength } = this.state;

    const image = this.getImage();
    this.clearImageFilters(image);

    // @ts-ignore - missing Blur filter annotation
    const blurFilter = new fabric.Image.filters.Blur({
      blur: blurStrength
    });

    image.filters?.push(blurFilter);
    image.applyFilters();

    this.canvas.renderAll();
  };

  onSepiaClick = (): void => {
    const { sepiaStrength: strength } = this.state;

    const image = this.getImage();
    this.clearImageFilters(image);

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

    image.filters?.push(filter);
    image.applyFilters();

    this.canvas.renderAll();
  };

  onVintageClick = (): void => {
    const { vintageStrength: strength } = this.state;
    const image = this.getImage();

    this.clearImageFilters(image);

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

    image.filters?.push(filter);
    image.applyFilters();

    this.canvas.renderAll();
  };

  renderControls(): null | ReactElement {
    const { src } = this.props;
    const { blurStrength, sepiaStrength, vintageStrength } = this.state;

    if (!src) {
      return null;
    }

    return (
      <div className="c-image-editor__controls">
        <Button onClick={this.onDownloadClick} value="Download" />

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