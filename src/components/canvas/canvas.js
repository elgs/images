import LWElement from './../../lib/lw-element.js';
import ast from './ast.js';

customElements.define('images-canvas',
  class extends LWElement {  // LWElement extends HTMLElement
    constructor() {
      super(ast);
    }

    canvas;
    isDrawing = false;
    source = false;

    brightness = 0;
    contrast = 1;

    // derived from LWElement
    domReady() {
      this.canvas = this.shadowRoot.querySelector('#original');
      if (!this.source) {
        leanweb.eventBus.addEventListener('image', event => {
          const data = event.data;
          this.bytesToCanvas(data.bytes, data.width, data.height);
          this.update();
        });

        leanweb.eventBus.addEventListener('clear', event => {
          this.clearCanvas();
          this.update();
        });
      }
    }

    loadFile(event) {
      if (!this.source) {
        return;
      }
      const file = event.target.files[0];
      this.loadFileToCanvas(file, this.canvas);
    }

    dragOver(event) {
      if (!this.source) {
        return;
      }
      event.preventDefault();
    }

    drop(event) {
      if (!this.source) {
        return;
      }
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      this.loadFileToCanvas(file, this.canvas);
    }

    loadFileToCanvas(file, canvas) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        await new Promise(r => img.onload = r, img.src = event.target.result);
        const ctx = canvas.getContext('2d');
        // canvas.width = img.width;
        // canvas.height = img.height;
        canvas.width = 600;
        canvas.height = 600 * img.height / img.width;
        console.log(canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      reader.readAsDataURL(file);
    }

    startDrawing(event) {
      if (!this.source) {
        return;
      }
      this.isDrawing = true;
      const ctx = this.canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(event.offsetX, event.offsetY);
    }

    draw(event) {
      if (!this.source) {
        return;
      }
      if (!this.isDrawing) {
        return;
      }
      const ctx = this.canvas.getContext('2d');
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'red';
      ctx.lineTo(event.offsetX, event.offsetY);
      ctx.stroke();
    }

    endDrawing(event) {
      if (!this.source) {
        return;
      }
      if (!this.isDrawing) {
        return;
      }
      this.isDrawing = false;
    }

    clearCanvas() {
      this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.source) {
        leanweb.eventBus.dispatchEvent('clear');
      }
    }

    rChannel() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        bytes[i] = imageData.data[i]; // red
        bytes[i + 1] = 0; // green
        bytes[i + 2] = 0; // blue
        bytes[i + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    gChannel() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        bytes[i] = 0; // red
        bytes[i + 1] = imageData.data[i + 1]; // green
        bytes[i + 2] = 0; // blue
        bytes[i + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    bChannel() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        bytes[i] = 0; // red
        bytes[i + 1] = 0; // green
        bytes[i + 2] = imageData.data[i + 2]; // blue
        bytes[i + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    gray() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        bytes[i] = gray; // red
        bytes[i + 1] = gray; // green
        bytes[i + 2] = gray; // blue
        bytes[i + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    invert() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        bytes[i] = 255 - imageData.data[i]; // red
        bytes[i + 1] = 255 - imageData.data[i + 1]; // green
        bytes[i + 2] = 255 - imageData.data[i + 2]; // blue
        bytes[i + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    horizontalFlip() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % this.canvas.width;
        const y = Math.floor((i / 4) / this.canvas.width);
        const newX = this.canvas.width - x - 1;
        const newI = (newX + y * this.canvas.width) * 4;
        bytes[newI] = imageData.data[i]; // red
        bytes[newI + 1] = imageData.data[i + 1]; // green
        bytes[newI + 2] = imageData.data[i + 2]; // blue
        bytes[newI + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    verticalFlip() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % this.canvas.width;
        const y = Math.floor((i / 4) / this.canvas.width);
        const newY = this.canvas.height - y - 1;
        const newI = (x + newY * this.canvas.width) * 4;
        bytes[newI] = imageData.data[i]; // red
        bytes[newI + 1] = imageData.data[i + 1]; // green
        bytes[newI + 2] = imageData.data[i + 2]; // blue
        bytes[newI + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    rotateLeft() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % this.canvas.width;
        const y = Math.floor((i / 4) / this.canvas.width);
        const newX = this.canvas.height - y - 1;
        const newY = x;
        const newI = (newX + newY * this.canvas.height) * 4;
        bytes[newI] = imageData.data[i]; // red
        bytes[newI + 1] = imageData.data[i + 1]; // green
        bytes[newI + 2] = imageData.data[i + 2]; // blue
        bytes[newI + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.height, height: this.canvas.width });
    }

    rotateRight() {
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % this.canvas.width;
        const y = Math.floor((i / 4) / this.canvas.width);
        const newX = y;
        const newY = this.canvas.width - x - 1;
        const newI = (newX + newY * this.canvas.height) * 4;
        bytes[newI] = imageData.data[i]; // red
        bytes[newI + 1] = imageData.data[i + 1]; // green
        bytes[newI + 2] = imageData.data[i + 2]; // blue
        bytes[newI + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.height, height: this.canvas.width });
    }

    setBrightness(value = 0) {
      this.brightness = value;
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        bytes[i] = imageData.data[i] + value; // red
        bytes[i + 1] = imageData.data[i + 1] + value; // green
        bytes[i + 2] = imageData.data[i + 2] + value; // blue
        bytes[i + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    setContrast(value = 1) {
      this.contrast = value;
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = new Array(imageData.data.length);
      for (let i = 0; i < imageData.data.length; i += 4) {
        bytes[i] = imageData.data[i] * value; // red
        bytes[i + 1] = imageData.data[i + 1] * value; // green
        bytes[i + 2] = imageData.data[i + 2] * value; // blue
        bytes[i + 3] = 255; // alpha
      }
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    horizontalEdges() {
      const kernel = [
        [1, 0, -1],
        [2, 0, -2],
        [1, 0, -1],
      ];
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = this.convolve(imageData.data, kernel);
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    verticalEdges() {
      const kernel = [
        [1, 2, 1],
        [0, 0, 0],
        [-1, -2, -1],
      ];
      const ctx = this.canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const bytes = this.convolve(imageData.data, kernel);
      leanweb.eventBus.dispatchEvent('image', { bytes, width: this.canvas.width, height: this.canvas.height });
    }

    convolve(data, kernel) {
      const kernelSize = kernel.length;
      const kernelRadius = Math.floor(kernelSize / 2);
      const result = new Array(data.length);
      for (let i = 0; i < data.length; i += 4) { // pixel
        let r = 0;
        let g = 0;
        let b = 0;
        for (let j = 0; j < kernelSize; ++j) { // row
          for (let l = 0; l < kernelSize; ++l) { // column
            const x = i + 4 * (j - kernelRadius) + 4 * this.canvas.width * (l - kernelRadius);
            if (x >= 0 && x < data.length) {
              r += data[x] * kernel[j][l];
              g += data[x + 1] * kernel[j][l];
              b += data[x + 2] * kernel[j][l];
            }
          }
        }
        result[i] = r;
        result[i + 1] = g;
        result[i + 2] = b;
        result[i + 3] = 255;
      }
      return result;
    }

    bytesToCanvas(bytes, width, height) {
      const imageData = new ImageData(new Uint8ClampedArray(bytes), width, height);
      this.canvas.width = width;
      this.canvas.height = height;
      const ctx = this.canvas.getContext('2d');
      ctx.putImageData(imageData, 0, 0);
    }

  }
);
