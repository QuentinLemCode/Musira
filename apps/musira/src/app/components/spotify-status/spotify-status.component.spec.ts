import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotifyStatusComponent } from './spotify-status.component';

describe('SpotifyStatusComponent', () => {
  let component: SpotifyStatusComponent;
  let fixture: ComponentFixture<SpotifyStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
