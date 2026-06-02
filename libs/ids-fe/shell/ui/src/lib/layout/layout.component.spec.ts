import { ComponentFixture, TestBed } from '@angular/core/testing'
import { IdsFeShellUiComponent } from './ids-fe-shell-ui.component'

describe('IdsFeShellUiComponent', () => {
  let component: IdsFeShellUiComponent
  let fixture: ComponentFixture<IdsFeShellUiComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdsFeShellUiComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(IdsFeShellUiComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
