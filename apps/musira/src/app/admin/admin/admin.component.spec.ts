import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserService } from '../../user/user.service';
import { AdminComponent } from './admin.component';
import { MusicSessionsService } from '../../sessions/music-sessions.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  const usersList = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
  ];

  const mockUserService = {
    getAllUsers: jest.fn(),
    delete: jest.fn(),
    unlock: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        {
          provide: MusicSessionsService,
          useValue: {
            getAll: jest.fn().mockReturnValue(of([])),
          },
        },
      ],
    }).compileComponents();
    mockUserService.getAllUsers.mockReturnValue(of(usersList));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on initialization', () => {
    component.ngOnInit();
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
    expect(component.usersList).toEqual(usersList);
  });

  it('should delete user and refresh users list', () => {
    const idToDelete = 1;
    mockUserService.delete.mockReturnValue(of());
    component.deleteUser(idToDelete);
    expect(mockUserService.delete).toHaveBeenCalledWith(idToDelete);
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
    expect(component.usersList).toEqual(usersList);
  });

  it('should unlock user and refresh users list', () => {
    const idToUnlock = 2;
    mockUserService.unlock.mockReturnValue(of());
    component.unlockUser(idToUnlock);
    expect(mockUserService.unlock).toHaveBeenCalledWith(idToUnlock);
    expect(mockUserService.getAllUsers).toHaveBeenCalled();
    expect(component.usersList).toEqual(usersList);
  });
});
