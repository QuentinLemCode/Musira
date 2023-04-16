import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicSessionComponent } from './music-session.component';

describe('MusicSessionComponent', () => {
  let component: MusicSessionComponent;
  let fixture: ComponentFixture<MusicSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MusicSessionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MusicSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
