import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCasesheetComponent } from './view-casesheet.component';

describe('ViewCasesheetComponent', () => {
  let component: ViewCasesheetComponent;
  let fixture: ComponentFixture<ViewCasesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCasesheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCasesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
