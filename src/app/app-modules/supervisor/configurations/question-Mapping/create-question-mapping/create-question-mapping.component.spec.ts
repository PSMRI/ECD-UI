import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuestionMappingComponent } from './create-question-mapping.component';

describe('CreateQuestionMappingComponent', () => {
  let component: CreateQuestionMappingComponent;
  let fixture: ComponentFixture<CreateQuestionMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateQuestionMappingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateQuestionMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
