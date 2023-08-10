import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import type { SocialUserDTO } from '@musira/api-interfaces/index';

@ChildEntity()
export class SocialLoginUser extends User implements SocialUserDTO {
  @Column()
  provider: string;

  @Column()
  photoUrl: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  idToken: string;
}
