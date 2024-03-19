import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTiffComponent } from './view-tiff.component';

describe('ViewTiffComponent', () => {
  let component: ViewTiffComponent;
  let fixture: ComponentFixture<ViewTiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTiffComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
