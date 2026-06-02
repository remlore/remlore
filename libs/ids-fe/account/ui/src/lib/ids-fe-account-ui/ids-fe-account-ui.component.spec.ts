import { ComponentFixture, TestBed } from '@angular/core/testing'
import { IdsFeAccountUiComponent } from './ids-fe-account-ui.component'

describe('IdsFeAccountUiComponent', () => {
  let component: IdsFeAccountUiComponent
  let fixture: ComponentFixture<IdsFeAccountUiComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdsFeAccountUiComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(IdsFeAccountUiComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
