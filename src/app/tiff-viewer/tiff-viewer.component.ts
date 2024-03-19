// tiff-viewer.component.ts
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';

import * as UTIF from 'utif';


declare var UTIF: any; // This line is necessary if UTIF.js is added via a script tag

@Component({
  selector: 'app-tiff-viewer',
  templateUrl: './tiff-viewer.component.html',
  styleUrls: ['./tiff-viewer.component.css']
})
export class TiffViewerComponent implements OnInit {
  @ViewChild('canvas') canvasRef: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  zoomLevel: number = 1;

  constructor() { }

  ngOnInit(): void {
    this.loadTiff('\\assets\\images\\akash.tif');
  }

  loadTiff(filePath: string): void {
    fetch(filePath).then(response => {
      response.arrayBuffer().then(buffer => {
        const tiffArray = new Uint8Array(buffer);
        const ifds = UTIF.parse(tiffArray);
        UTIF.decodeImages(tiffArray, ifds);
        const tiffImage = ifds[0];
        const canvas = this.canvasRef.nativeElement;
        canvas.width = tiffImage.width;
        canvas.height = tiffImage.height;
        this.ctx = canvas.getContext('2d');
        const rgba = UTIF.toRGBA8(tiffImage); // convert to RGBA buffer
        const imgData = new ImageData(new Uint8ClampedArray(rgba), tiffImage.width, tiffImage.height);
        this.ctx.putImageData(imgData, 0, 0);
      });
    });
  }

  zoomIn(): void {
    this.zoomLevel *= 1.1;
    this.applyZoom();
  }

  zoomOut(): void {
    this.zoomLevel *= 0.9;
    this.applyZoom();
  }

  private applyZoom(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.style.transform = `scale(${this.zoomLevel})`;
    canvas.style.transformOrigin = 'top left';
  }

  print(): void {
    const canvas = this.canvasRef.nativeElement;
    const dataUrl = canvas.toDataURL();
    const windowContent = `<img src="${dataUrl}">`;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(windowContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}
