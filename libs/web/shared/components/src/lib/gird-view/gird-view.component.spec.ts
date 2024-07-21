import { ComponentFixture, TestBed } from '@angular/core/testing'
import { GirdViewComponent } from './gird-view.component'

describe('GirdViewComponent', () => {
  let component: GirdViewComponent
  let fixture: ComponentFixture<GirdViewComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GirdViewComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(GirdViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
