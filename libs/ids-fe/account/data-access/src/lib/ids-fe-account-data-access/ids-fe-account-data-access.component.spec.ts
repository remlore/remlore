import { ComponentFixture, TestBed } from '@angular/core/testing'
import { IdsFeAccountDataAccessComponent } from './ids-fe-account-data-access.component'

describe('IdsFeAccountDataAccessComponent', () => {
  let component: IdsFeAccountDataAccessComponent
  let fixture: ComponentFixture<IdsFeAccountDataAccessComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdsFeAccountDataAccessComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(IdsFeAccountDataAccessComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
