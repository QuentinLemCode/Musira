import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity.js';
import type { SocialLoginUserInterface } from '#api-interfaces/index.js';

@ChildEntity()
export class SocialLoginUser extends User implements SocialLoginUserInterface {
  @Column()
  provider: string;

  @Column()
  photoUrl: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
