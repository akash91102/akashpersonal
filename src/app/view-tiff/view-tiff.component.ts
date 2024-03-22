import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';

// If you face issues with importing tiff.js directly, you might need to declare it as any or find the correct type definitions
declare var Tiff: any;

@Component({
  selector: 'app-view-tiff',
  templateUrl: './view-tiff.component.html',
  styleUrls: ['./view-tiff.component.css']
})
export class ViewTiffComponent implements OnInit,AfterViewInit {
  // @ViewChild('tiffCanvas', { static: true }) tiffCanvas: ElementRef;

  @ViewChild('tiffCanvas', { static: true }) tiffCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('thumbnailsContainer') thumbnailsContainer: ElementRef;
  @ViewChild('pagesContainer') pagesContainer: ElementRef;
  @ViewChild('canvasWrapper', { static: true }) canvasWrapper: ElementRef<HTMLDivElement>;

  @ViewChild('magnifierCanvas') magnifierCanvas: ElementRef<HTMLCanvasElement>;
  showMagnifier = false;
  magnifierPosX = 0;
  magnifierPosY = 0;
  magnificationFactor = 2;
  magnifierEnabled = false; 

  drawingMode: 'arrow' | 'circle' | '' = '';
  drawingStart: { x: number, y: number } = { x: 0, y: 0 };

  scale = 1;
  rotation = 0;
  currentPage = 0; // Current page index
  totalPages = 0; // Total number of pages in the TIFF file

  pageNumberInput:number=1;

   // Specify the path to your TIFF file
    tiffUrl = '\\assets\\images\\as.tif';

    tiff: any; // Declare the TIFF property here

    pages:{thumbnailUrl:string}[]=[];


  constructor() { }

  ngOnInit() {
    this.loadTiffImage();
  }

  

  loadTiffImage() {
   

    // Fetch the TIFF file
    fetch(this.tiffUrl)
      .then(response => response.arrayBuffer())
      .then(tiffData => {

        Tiff.initialize({TOTAL_MEMORY:103809024});

        // Initialize the TIFF.js library with the TIFF data
        const tiff = new Tiff({ buffer: tiffData });
        this.tiff=tiff;

        this.totalPages=tiff.countDirectory();
        this.generateThumbnails();

        this.renderAllPages();

        // this.totalPages = this.tiff.countDirectory();
        // this.renderAllPages(); 
        
        // Render the first page of the TIFF file onto a canvas
        // const canvas = this.tiffCanvas.nativeElement;
        // canvas.width = tiff.width();
        // canvas.height = tiff.height();
        // const ctx = canvas.getContext('2d');
        // const tiffCanvas = tiff.toCanvas();
        // ctx.drawImage(tiffCanvas, 0, 0);
      })
      .catch(error => console.error('Error loading TIFF image:', error));
  }

  // renderAllPages() {
  //   if (!this.tiff) {
  //     console.error('TIFF object is not initialized.');
  //     return;
  //   }
  
  //   for (let i = 0; i < this.totalPages; i++) {
  //     this.tiff.setDirectory(i);
  //     const tiffCanvas = this.tiff.toCanvas();
  //     const canvasElement = document.getElementById('pageCanvas' + i) as HTMLCanvasElement;
  
  //     if (canvasElement) {
  //       const ctx = canvasElement.getContext('2d');
  //       if (tiffCanvas && ctx) {
  //         canvasElement.width = tiffCanvas.width;
  //         canvasElement.height = tiffCanvas.height;
  //         ctx.drawImage(tiffCanvas, 0, 0);
  //       }
  //     }
  //   }
  // }

  renderAllPages1() {
    if (!this.tiff) {
      console.error('TIFF object is not initialized.');
      return;
    }
  
    // Assuming totalPages is correctly set
    for (let i = 0; i < this.totalPages; i++) {
      this.tiff.setDirectory(i);
      const tiffCanvas = this.tiff.toCanvas();
      
      // Create a new Blob URL for each page's canvas as an alternative approach
      const canvasElement = document.getElementById('pageCanvas' + i) as HTMLCanvasElement;

      if (canvasElement) {
        const ctx = canvasElement.getContext('2d');
        if (tiffCanvas && ctx) {
         // Set canvas dimensions to match the TIFF page dimensions
canvasElement.width = tiffCanvas.width;
canvasElement.height = tiffCanvas.height;
// Render the TIFF page onto the canvas
const ctx = canvasElement.getContext('2d');
ctx.drawImage(tiffCanvas, 0, 0);

        }
      }
    }
  }
  
 
  ngAfterViewInit() {
    this.adjustCanvasSize();
    this.renderPage();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.adjustCanvasSize();
    this.renderPage(); // Rerender the current page to fit the new canvas size
  }

  adjustCanvasSize() {
    const parent = this.canvasWrapper.nativeElement;
    const canvas = this.tiffCanvas.nativeElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }

  renderPage1() {
    if (!this.tiff || this.currentPage < 0 || this.currentPage >= this.totalPages) {
      console.error('TIFF object is not initialized or page index out of bounds.');
      return;
    }

    const canvas = this.tiffCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    // Clear the canvas and reset transformations
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformations

    // Set the current page
    this.tiff.setDirectory(this.currentPage);
    const tiffCanvas = this.tiff.toCanvas();

    // Adjust canvas size based on the scale
    canvas.width = tiffCanvas.width * this.scale;
    canvas.height = tiffCanvas.height * this.scale;

    // Apply the scale and redraw
    ctx.scale(this.scale, this.scale);
    ctx.drawImage(tiffCanvas, 0, 0);
  }


  renderAllPages() {


    if (!this.tiff) {
      console.error('TIFF object is not initialized.');
      return;
    }

    const canvas = this.tiffCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Get the width and height of the first page
    this.tiff.setDirectory(0);
    const firstPageCanvas = this.tiff.toCanvas();
    const pageWidth = firstPageCanvas.width;
    const pageHeight = firstPageCanvas.height;

    // Set canvas height to accommodate all pages
    canvas.width = pageWidth;
    canvas.height = pageHeight * this.totalPages;

    // Render each page onto the canvas
    for (let i = 0; i < this.totalPages; i++) {
      this.tiff.setDirectory(i);
      const pageCanvas = this.tiff.toCanvas();
      ctx.drawImage(pageCanvas, 0, i * pageHeight);
    }
    // if (!this.tiff) {
    //   console.error('TIFF object is not initialized.');
    //   return;
    // }
  
    // const canvas = this.tiffCanvas.nativeElement;
    // const ctx = canvas.getContext('2d');
    // ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // // Calculate total width required for all pages
    // const totalWidth = this.totalPages * canvas.width;

    // // Set canvas width to accommodate all pages
    // canvas.width = totalWidth;
  
    // for (let i = 0; i < this.totalPages; i++) {
    //   // Set the current page and render it on the canvas
    //   this.tiff.setDirectory(i);
    //   const tiffCanvas = this.tiff.toCanvas();
    //   canvas.width = tiffCanvas.width * this.scale;
    //   canvas.height = tiffCanvas.height * this.scale;
    //   ctx.translate(canvas.width / 2, canvas.height / 2);
    //   ctx.rotate((Math.PI / 180) * this.rotation);
    //   ctx.scale(this.scale, this.scale);
    //   ctx.drawImage(tiffCanvas, -tiffCanvas.width / 2, -tiffCanvas.height / 2);
    // }

    // Render each page onto the canvas
    // for (let i = 0; i < this.totalPages; i++) {
    //   this.tiff.setDirectory(i);
    //   const tiffCanvas = this.tiff.toCanvas();
    //   ctx.drawImage(tiffCanvas, i * canvas.width, 0);
    // }

 // After rendering all pages, render the first page
 this.currentPage = 0;
 this.renderPage();
  }
  
  zoomIn() {
    this.scale *= 1.1; // Increase scale
    this.renderPage(); // Call renderPage to redraw at the new scale
  }
    
  zoomOut() {
    this.scale /= 1.1; // Decrease scale
    this.renderPage(); // Call renderPage to redraw at the new scale
  }
  


  rotateClockwise() {
    this.rotation += 90; // Increase rotation
    this.renderTransformedCanvas();
  }

  rotateAntiClockwise() {
    this.rotation -= 90; // Increase rotation
    this.renderTransformedCanvas();
  }

  renderTransformedCanvas() {
    if (!this.tiff) {
      console.error('TIFF object is not initialized.');
      return;
    }
  
    const canvas = this.tiffCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  
    // Render each page individually with rotation
    this.tiff.setDirectory(this.currentPage); // Set the current page
    const tiffCanvas = this.tiff.toCanvas();
  
    // Adjust canvas size and draw the transformed image
    canvas.width = tiffCanvas.width * this.scale;
    canvas.height = tiffCanvas.height * this.scale;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((Math.PI / 180) * this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.drawImage(tiffCanvas, -tiffCanvas.width / 2, -tiffCanvas.height / 2);
  }
  

  printImage() {
    if (!this.tiff || this.totalPages === 0) {
      console.error('TIFF object is not initialized or there are no pages to print.');
      return;
    }
  
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print All Pages</title></head><body>');
      for (let i = 0; i < this.totalPages; i++) {
        // Dynamically create a canvas for each page
        const pageCanvas = document.createElement('canvas');
        this.tiff.setDirectory(i);
        const tiffCanvas = this.tiff.toCanvas();
        pageCanvas.width = tiffCanvas.width;
        pageCanvas.height = tiffCanvas.height;
        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(tiffCanvas, 0, 0);
  
        // Convert canvas content to data URL and append an img element for it
        const dataUrl = pageCanvas.toDataURL();
        printWindow.document.write(`<img src="${dataUrl}" style="width:100%;max-width:800px;page-break-after:always;">`);
      }
      printWindow.document.write('</body></html>');
      printWindow.document.close(); // Necessary for some older browsers
      printWindow.focus(); // Necessary for some browsers to trigger print
      // Use a timeout to ensure everything is loaded before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    } else {
      console.error('Failed to open new window for printing');
    }
  }
  

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.pageNumberInput = this.currentPage + 1; // Update pageNumberInput here
      this.renderPage();
    } else {
      console.log("You're on the last page.");
    }
  }
  
  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.pageNumberInput = this.currentPage + 1; // Update pageNumberInput here
      this.renderPage();
    } else {
      console.log("You're on the first page.");
    }
  }
 
  renderPage() {
    if (!this.tiff || this.currentPage < 0 || this.currentPage >= this.totalPages) {
      console.error('TIFF object is not initialized or page index out of bounds.');
      return;
    }
  
    const canvas = this.tiffCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas and reset transformations
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformations
    
    // Set the current page
    this.tiff.setDirectory(this.currentPage);
    const tiffCanvas = this.tiff.toCanvas();
    
    // Adjust canvas size based on the scale
    canvas.width = tiffCanvas.width * this.scale;
    canvas.height = tiffCanvas.height * this.scale;
    
    // Apply the scale and redraw
    ctx.scale(this.scale, this.scale);
    ctx.drawImage(tiffCanvas, 0, 0);
  }
  
  


  goToPage(){
    if(this.pageNumberInput>=1 && this.pageNumberInput<=this.totalPages){
      this.currentPage=this.pageNumberInput-1;
      this.renderPage();
    }
  }

  // selectPage(pageIndex:number){
  //   this.currentPage=pageIndex;
  //   this.populatePages();
  //   this.renderPage();
  // }


  // selectPage(pageIndex: number) {
  //   this.currentPage = pageIndex;
  //   this.pageNumberInput = this.currentPage+1;
  //   this.renderPage();
  // }
  
  selectPage(pageIndex: number) {
    this.currentPage = pageIndex;
    this.pageNumberInput = this.currentPage+1;
    this.renderPage();
    this.scrollToCurrentThumbnail(); // Ensure the thumbnail view scrolls to the current page
  }
  

  populatePages(){

   for(let i=0;i<this.totalPages;i++){
    const thumbnailUrl=`path/tj`;
    this.pages.push({thumbnailUrl})
   }


  }


  generateThumbnails() {
  this.pages = []; // Ensure this is clearing or initializing correctly

  for (let i = 0; i < this.totalPages; i++) {
    this.tiff.setDirectory(i);
    const tiffCanvas = this.tiff.toCanvas();
    const thumbnailUrl = tiffCanvas.toDataURL();
    this.pages.push({thumbnailUrl});
  }

  console.log(this.pages );

}


scrollToCurrentThumbnail() {
  if (this.thumbnailsContainer && this.pages.length > 0) {
    const thumbnailHeight = this.thumbnailsContainer.nativeElement.firstChild.offsetHeight;
    const scrollPosition = thumbnailHeight * this.currentPage;
    this.thumbnailsContainer.nativeElement.scrollTop = scrollPosition - (thumbnailHeight * 2); // Adjust based on your needs
  }
}


fitToWindowWidth() {
  // Fit the canvas to the window width
  const canvas = this.tiffCanvas.nativeElement;
  const scaleFactor = window.innerWidth / canvas.width;
  canvas.width = window.innerWidth;
  canvas.height *= scaleFactor;

  this.renderPage();
}

fitToWindowHeight() {
  // Fit the canvas to the window height
  const canvas = this.tiffCanvas.nativeElement;
  const scaleFactor = window.innerHeight / canvas.height;
  canvas.height = window.innerHeight;
  canvas.width *= scaleFactor;
}

fitToWindow() {
  // Fit the canvas to the window (both width and height)
  const canvas = this.tiffCanvas.nativeElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}


adjustContrast(contrast: number = 1) {
  const canvas = this.tiffCanvas.nativeElement;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return;
  }

  // Get the current ImageData from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Adjust contrast formula: f(c) = (259 * (c + 255)) / (255 * (259 - c))
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) { // Iterate over each pixel and adjust
    data[i] = factor * (data[i] - 128) + 128;     // Red
    data[i + 1] = factor * (data[i + 1] - 128) + 128; // Green
    data[i + 2] = factor * (data[i + 2] - 128) + 128; // Blue
    // Alpha (data[i + 3]) is unchanged
  }

  // Put the modified ImageData back to the canvas
  ctx.putImageData(imageData, 0, 0);
}


invertColors() {
  const canvas = this.tiffCanvas.nativeElement;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return;
  }

  // Get the current ImageData from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) { // Iterate over each pixel
    data[i] = 255 - data[i];     // Invert Red
    data[i + 1] = 255 - data[i + 1]; // Invert Green
    data[i + 2] = 255 - data[i + 2]; // Invert Blue
    // Alpha (data[i + 3]) is unchanged
  }

  // Put the modified ImageData back to the canvas
  ctx.putImageData(imageData, 0, 0);
}


@HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {

    if (!this.magnifierEnabled) {
      return; // Do nothing if the magnifier is not enabled
    }

    this.showMagnifier = true;
    this.magnifierPosX = event.clientX - 100; // Offset for the magnifier lens
    this.magnifierPosY = event.clientY - 100;

    this.updateMagnifier(event);
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    this.showMagnifier = false;
  }

  updateMagnifier(event: MouseEvent) {
    if (!this.showMagnifier || !this.magnifierCanvas) return;

    const magnifierCtx = this.magnifierCanvas.nativeElement.getContext('2d');
    const bounds = this.tiffCanvas.nativeElement.getBoundingClientRect();

    // Calculate the position of the cursor relative to the canvas
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    // Clear the magnifier canvas
    magnifierCtx.clearRect(0, 0, this.magnifierCanvas.nativeElement.width, this.magnifierCanvas.nativeElement.height);

    // Draw the magnified portion of the image
    magnifierCtx.drawImage(
      this.tiffCanvas.nativeElement,
      x - (50 / this.magnificationFactor), y - (50 / this.magnificationFactor), // Source coordinates
      100 / this.magnificationFactor, 100 / this.magnificationFactor, // Source dimensions
      0, 0, // Destination coordinates
      200, 200 // Destination dimensions
    );
  }

  toggleMagnifier() {
    this.magnifierEnabled = !this.magnifierEnabled;
    this.showMagnifier = false; // Hide the magnifier when toggled off
  }

  startDrawing(event: MouseEvent, mode: 'arrow' | 'circle' | '') {
    const rect = this.tiffCanvas.nativeElement.getBoundingClientRect();
    this.drawingMode = mode;
    this.drawingStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  finishDrawing(event: MouseEvent) {
    if (!this.drawingMode || !this.tiffCanvas) return;
  
    const ctx = this.tiffCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
  
    const rect = this.tiffCanvas.nativeElement.getBoundingClientRect();
    const end = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  
    ctx.beginPath();
    if (this.drawingMode === 'circle') {
      const radius = Math.sqrt(Math.pow(end.x - this.drawingStart.x, 2) + Math.pow(end.y - this.drawingStart.y, 2));
      ctx.arc(this.drawingStart.x, this.drawingStart.y, radius, 0, 2 * Math.PI);
      ctx.stroke(); // Ensure you're calling stroke() to actually draw the circle
    }
    // Handle other drawing modes (like 'arrow') here...
  
    this.drawingMode = ''; // Reset drawing mode
  }
  

  draw(event: MouseEvent) {
    if (!this.drawingMode) return;

    const rect = this.tiffCanvas.nativeElement.getBoundingClientRect();
    const end = { x: event.clientX - rect.left, y: event.clientY - rect.top };

    const ctx = this.tiffCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();

    if (this.drawingMode === 'circle') {
      const radius = Math.sqrt(Math.pow(end.x - this.drawingStart.x, 2) + Math.pow(end.y - this.drawingStart.y, 2));
      ctx.arc(this.drawingStart.x, this.drawingStart.y, radius, 0, 2 * Math.PI);
    } else if (this.drawingMode === 'arrow') {
      // Arrow drawing is more complex and might require a custom implementation
      // This is a simple line for illustration purposes
      ctx.moveTo(this.drawingStart.x, this.drawingStart.y);
      ctx.lineTo(end.x, end.y);
      // Add more canvas operations here to draw the arrowhead
    }

    ctx.stroke();
    this.drawingMode = ''; // Reset drawing mode to stop drawing
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.drawingMode) {
      this.draw(event);
    }
  }

ngOnDestroy() {
  // Properly deallocate the TIFF object to prevent memory leaks
  if (this.tiff) {
    this.tiff.close();
    this.tiff = null;
  }
}

  
}
