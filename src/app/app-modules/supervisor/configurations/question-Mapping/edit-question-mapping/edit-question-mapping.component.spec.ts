import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditQuestionMappingComponent } from './edit-question-mapping.component';

describe('EditQuestionMappingComponent', () => {
  let component: EditQuestionMappingComponent;
  let fixture: ComponentFixture<EditQuestionMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditQuestionMappingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditQuestionMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
