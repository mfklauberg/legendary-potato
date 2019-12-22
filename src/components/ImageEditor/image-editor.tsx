import React, { ReactElement, createRef, Component } from 'react';
import { fabric } from 'fabric';

import './image-editor.css';

import { Button } from '..';

interface Props {
  name: string;
  src: string;
};

interface State {
}

class ImageEditor extends Component<Props, State> {
  private canvasRef = createRef<HTMLCanvasElement>();
  private canvas!: fabric.Canvas;
  private objectScale = .25;

  componentDidMount(): void {
    const canvasElement = this.canvasRef.current as unknown as HTMLCanvasElement;

    fabric.textureSize = 4096;

    this.canvas = new fabric.Canvas(canvasElement, {
      interactive: false,
    });
  }

  shouldComponentUpdate(lastProps: Props) {
    const { src } = this.props;

    return lastProps.src !== src;
  }

  componentDidUpdate(): void {
    const { src } = this.props;

    this.canvas.clear();

    fabric.Image.fromURL(src, (image) => {
      const obj = image
        .set({ left: 0, top: 0 })
        .scale(this.objectScale);

      this.lockObject(obj);

      this.canvas.add(obj);
      this.canvas.setWidth((image.width || 0) * this.objectScale);
      this.canvas.setHeight((image.height || 0) * this.objectScale);
    });
  }

  lockObject = (obj: fabric.Object) => {
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

  onDownloadClick = () => {
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

  renderControls(): null | ReactElement {
    const { src } = this.props;

    if (!src) {
      return null;
    }

    return (
      <div className="c-image-editor__controls">
        <Button onClick={this.onDownloadClick} value="Download" />

        <span className="c-image-editor__label">Filters:</span>
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

// function applyFilter(index, filter) {
//   var obj = canvas.getActiveObject();
//   obj.filters[index] = filter;
//   var timeStart = +new Date();
//   obj.applyFilters();
//   var timeEnd = +new Date();
//   var dimString = canvas.getActiveObject().width + ' x ' +
//     canvas.getActiveObject().height;
//   $('bench').innerHTML = dimString + 'px ' +
//     parseFloat(timeEnd-timeStart) + 'ms';
//   canvas.renderAll();
// }

// $('brownie').onclick = function() {
//   applyFilter(4, this.checked && new f.Brownie());
// };
// $('vintage').onclick = function() {
//   applyFilter(9, this.checked && new f.Vintage());
// };
// $('technicolor').onclick = function() {
//   applyFilter(14, this.checked && new f.Technicolor());
// };
// $('polaroid').onclick = function() {
//   applyFilter(15, this.checked && new f.Polaroid());
// };
// $('kodachrome').onclick = function() {
//   applyFilter(18, this.checked && new f.Kodachrome());
// };
// $('blackwhite').onclick = function() {
//   applyFilter(19, this.checked && new f.BlackWhite());
// };
// $('grayscale').onclick = function() {
//   applyFilter(0, this.checked && new f.Grayscale());
// };
// $('average').onclick = function() {
//   applyFilterValue(0, 'mode', 'average');
// };
// $('luminosity').onclick = function() {
//   applyFilterValue(0, 'mode', 'luminosity');
// };
// $('lightness').onclick = function() {
//   applyFilterValue(0, 'mode', 'lightness');
// };
// $('invert').onclick = function() {
//   applyFilter(1, this.checked && new f.Invert());
// };