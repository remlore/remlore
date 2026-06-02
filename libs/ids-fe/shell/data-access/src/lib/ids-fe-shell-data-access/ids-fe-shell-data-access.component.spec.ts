import { ComponentFixture, TestBed } from '@angular/core/testing'
import { IdsFeShellDataAccessComponent } from './ids-fe-shell-data-access.component'

describe('IdsFeShellDataAccessComponent', () => {
  let component: IdsFeShellDataAccessComponent
  let fixture: ComponentFixture<IdsFeShellDataAccessComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdsFeShellDataAccessComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(IdsFeShellDataAccessComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
