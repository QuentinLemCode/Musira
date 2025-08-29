import { ChildEntity, Column, Index } from 'typeorm';
import type { OAuthProviderType } from '../auth/types';
import { User } from './user.entity';

@ChildEntity()
export class OAuthUser extends User {
  @Column('varchar')
  @Index({ unique: true })
  externalId: string;

  @Column('varchar')
  provider: OAuthProviderType;

  @Column('varchar')
  photoUrl: string;

  @Column('varchar')
  firstName: string;

  @Column('varchar')
  lastName: string;
}
