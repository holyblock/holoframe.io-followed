import { v4 as uuidv4 } from 'uuid';

class CanvasText {
  private _id: string;

  private text: string;

  private lineHeight: number = 24;

  private fontFamily: string = 'Roboto';

  private color: string = '#000';

  private size: {
    width: number;
    height: number;
  };

  constructor(_text: string) {
    this.text = _text;
    this._id = uuidv4();

    this.calculateSize();
  }

  public getId = () => {
    return this._id;
  };

  public getSize = () => {
    return this.size;
  };

  public setLineHeight = (lineHeight: number) => {
    this.lineHeight = lineHeight;
  };

  public setSize = ({ width, height }: { width: number; height: number }) => {
    this.size = {
      width,
      height,
    };
  };

  public setColor = (color: string) => {
    this.color = color;
  };

  public getText = () => {
    return this.text;
  };

  public calculateSize = () => {
    const canvas = document.getElementById(
      'output-canvas'
    ) as HTMLCanvasElement;
    const canvasContext = canvas.getContext('2d');
    canvasContext.font = `${this.lineHeight}px ${this.fontFamily}`;

    let totalHeight = 0;
    let maxWidth = 0;

    this.text.split(/\r?\n/).map((txt) => {
      const { width } = canvasContext.measureText(txt);
      totalHeight += this.lineHeight;
      if (width > maxWidth) maxWidth = width;
    });

    this.size = {
      width: maxWidth,
      height: totalHeight,
    };
  };

  public updateText = (text: string) => {
    this.text = text;
    this.calculateSize();
  };

  public display = (
    canvasContext: CanvasRenderingContext2D,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) => {
    const textArray = this.text.split(/\r?\n/);

    this.setLineHeight(dh / textArray.length);
    canvasContext.textBaseline = 'top';
    canvasContext.font = `${this.lineHeight}px ${this.fontFamily}`;
    canvasContext.fillStyle = this.color;

    this.setSize({ width: dw, height: dh });

    let offset = 0;
    const items = textArray.map((txt) => {
      const { width } = canvasContext.measureText(txt);
      const item = {
        txt,
        width,
        offset,
      };
      offset += this.lineHeight;
      return item;
    });

    items.forEach((item) => {
      const x = dx;
      const y = item.offset + dy;
      canvasContext.fillText(item.txt, x, y);
    });
  };
}

export default CanvasText;
