import { ComponentFixture, TestBed } from '@angular/core/testing'
import { IdsFeAccountFeatureComponent } from './ids-fe-account-feature.component'

describe('IdsFeAccountFeatureComponent', () => {
  let component: IdsFeAccountFeatureComponent
  let fixture: ComponentFixture<IdsFeAccountFeatureComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdsFeAccountFeatureComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(IdsFeAccountFeatureComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
