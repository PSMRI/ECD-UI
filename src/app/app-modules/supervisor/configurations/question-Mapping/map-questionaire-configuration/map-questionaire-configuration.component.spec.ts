import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapQuestionaireConfigurationComponent } from './map-questionaire-configuration.component';

describe('MapQuestionaireConfigurationComponent', () => {
  let component: MapQuestionaireConfigurationComponent;
  let fixture: ComponentFixture<MapQuestionaireConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapQuestionaireConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapQuestionaireConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
