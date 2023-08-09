import { HttpClientTestingModule } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SpotifyDeviceComponent } from './spotify-device.component';

describe('SpotifyDeviceComponent', () => {
  let component: SpotifyDeviceComponent;
  let fixture: ComponentFixture<SpotifyDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyDeviceComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SpotifyDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
