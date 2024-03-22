import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TiffViewerComponent } from './tiff-viewer/tiff-viewer.component';
import { ViewTiffComponent } from './view-tiff/view-tiff.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    TiffViewerComponent,
    ViewTiffComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule 
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
