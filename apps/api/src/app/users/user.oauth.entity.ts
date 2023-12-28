import { OAuthProvider } from '@musira/api-interfaces/index';
import { ChildEntity, Column, Index } from 'typeorm';
import { User } from './user.entity';

@ChildEntity()
export class OAuthUser extends User {
  @Column()
  @Index({ unique: true })
  externalId: string;

  @Column({
    type: 'int',
  })
  provider: OAuthProvider;

  @Column()
  photoUrl: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
}
