export class Scene {
  private items: HTMLImageElement[];
  private backgroundColor: string;

  // Abstract base class for static items (pngs) to render
  constructor() {
    this.items = [];
    this.backgroundColor = '';
  };

  public addItem(imageUrl: string) {
    if (this.backgroundColor) this.backgroundColor = '';
    const img = new Image();
    img.src = imageUrl;
    this.items.push(img);
  };

  public removeItem(imageUrl: string) {
    this.items = this.items.filter(item => item.src !== imageUrl);
  };

  public clearItems() {
    this.items = [];
  };

  public hasItems() {
    return this.items.length > 0 || this.backgroundColor !== '';
  };

  public setBackgroundColor(color: string) {
    this.clearItems(); // TODO: allow including other items on top of color
    this.backgroundColor = color;
  };

  public display(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D) {
    if (this.backgroundColor) {
      // Draw background color
      // TODO: allow including other items on top of color
      canvasCtx.fillStyle = this.backgroundColor;
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // display the current frame on canvas
      for (const item of this.items) {
        const width = item.width;
        const height = item.height;

        const ratio = Math.max(
          canvas.width / width,
          canvas.height / height
        );
        // get the top left position of the image
        const x = (canvas.width / 2) - (width / 2) * ratio;
        const y = (canvas.height / 2) - (height / 2) * ratio;
        canvasCtx.drawImage(item, x, y, width * ratio, height * ratio);
      }
    }
  };
}
