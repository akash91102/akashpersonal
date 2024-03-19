import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// If you face issues with importing tiff.js directly, you might need to declare it as any or find the correct type definitions
declare var Tiff: any;

@Component({
  selector: 'app-view-tiff',
  templateUrl: './view-tiff.component.html',
  styleUrls: ['./view-tiff.component.css']
})
export class ViewTiffComponent implements OnInit {
  // @ViewChild('tiffCanvas', { static: true }) tiffCanvas: ElementRef;

  @ViewChild('tiffCanvas', { static: true }) tiffCanvas: ElementRef<HTMLCanvasElement>;
  scale = 1;
  rotation = 0;
  currentPage = 0; // Current page index
  totalPages = 0; // Total number of pages in the TIFF file
   // Specify the path to your TIFF file
    tiffUrl = '\\assets\\images\\akash.tif';

    tiff: any; // Declare the TIFF property here


  constructor() { }

  ngOnInit() {
    this.loadTiffImage();
  }

  

  loadTiffImage() {
   

    // Fetch the TIFF file
    fetch(this.tiffUrl)
      .then(response => response.arrayBuffer())
      .then(tiffData => {
        // Initialize the TIFF.js library with the TIFF data
        const tiff = new Tiff({ buffer: tiffData });
        this.tiff=tiff;
        
        // Render the first page of the TIFF file onto a canvas
        const canvas = this.tiffCanvas.nativeElement;
        canvas.width = tiff.width();
        canvas.height = tiff.height();
        const ctx = canvas.getContext('2d');
        const tiffCanvas = tiff.toCanvas();
        ctx.drawImage(tiffCanvas, 0, 0);
      })
      .catch(error => console.error('Error loading TIFF image:', error));
  }


 

  

  rotateClockwise() {
    this.rotation += 90; // Increase rotation
    this.renderTransformedCanvas();
  }

  renderTransformedCanvas() {


    fetch(this.tiffUrl)
    .then(response => response.arrayBuffer())
    .then(tiffData => {
      // Initialize the TIFF.js library with the TIFF data
      const tiff = new Tiff({ buffer: tiffData });

      this.tiff=tiff;
      
      // Render the first page of the TIFF file onto a canvas
      const canvas = this.tiffCanvas.nativeElement;
      canvas.width = tiff.width();
      canvas.height = tiff.height();
      const ctx = canvas.getContext('2d');
      const tiffCanvas = tiff.toCanvas();
      // ctx.drawImage(tiffCanvas, 0, 0);



    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Adjust canvas size and draw the transformed image
    canvas.width = tiff.width() * this.scale;
    canvas.height = tiff.height() * this.scale;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((Math.PI / 180) * this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.drawImage(tiff.toCanvas(), -tiff.width() / 2, -tiff.height() / 2);


    })
    .catch(error => console.error('Error loading TIFF image:', error));


    
  }

  printImage() {
    // Ensure there's something to print
    if (!this.tiffCanvas.nativeElement) {
      console.error('Canvas element is not available');
      return;
    }
  
    // Convert the canvas content to a data URL
    const dataUrl = this.tiffCanvas.nativeElement.toDataURL();
  
    // Open a new window or tab and set its document's body to contain the image
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Print</title></head><body><img src="${dataUrl}" onload="window.print();window.close()" style="max-width: 100%;"></body></html>`);
      printWindow.document.close(); // Necessary for some older browsers
      printWindow.focus(); // Necessary for some browsers to trigger print
    } else {
      console.error('Failed to open new window for printing');
    }
  }
  

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.renderPage();
    } else {
      console.log("You're on the last page.");
    }
  }
  
  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.renderPage();
    } else {
      console.log("You're on the first page.");
    }
  }
  renderPage() {
    if (!this.tiff) {
      console.error('TIFF object is not initialized.');
      return;
    }
  
    // Clear existing canvas content
    const ctx = this.tiffCanvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, this.tiffCanvas.nativeElement.width, this.tiffCanvas.nativeElement.height);
  
    // Reset transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  
    // Set the current page and redraw
    this.tiff.setDirectory(this.currentPage);
    const tiffCanvas = this.tiff.toCanvas();
    this.tiffCanvas.nativeElement.width = tiffCanvas.width * this.scale;
    this.tiffCanvas.nativeElement.height = tiffCanvas.height * this.scale;
  
    ctx.translate(this.tiffCanvas.nativeElement.width / 2, this.tiffCanvas.nativeElement.height / 2);
    ctx.rotate((Math.PI / 180) * this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.drawImage(tiffCanvas, -tiffCanvas.width / 2, -tiffCanvas.height / 2);
  }
  


  // renderPage() {
  //   const canvas = this.tiffCanvas.nativeElement;
  //   const ctx = canvas.getContext('2d');
  //   ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas to prevent old content from showing
    
  //   // Reset transformations to apply new ones correctly
  //   ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  //   // Assume this.tiff is your TIFF instance and correctly set to the current page
  //   this.tiff.setDirectory(this.currentPage);
  //   const tiffCanvas = this.tiff.toCanvas();
  
  //   // Adjust the canvas size for the current zoom level
  //   canvas.width = tiffCanvas.width * this.scale;
  //   canvas.height = tiffCanvas.height * this.scale;
  
  //   // Apply rotation around the center of the canvas
  //   ctx.translate(canvas.width / 2, canvas.height / 2);
  //   ctx.rotate((Math.PI / 180) * this.rotation);
  //   ctx.scale(this.scale, this.scale);
  
  //   // Draw the image adjusted for rotation and scale
  //   ctx.drawImage(tiffCanvas, -tiffCanvas.width / 2, -tiffCanvas.height / 2);
  // }
  
  zoomIn() {
    this.scale *= 1.1;
    this.renderPage();
  }
  
  zoomOut() {
    this.scale *= 0.9;
    this.renderPage();
  }
  
}
