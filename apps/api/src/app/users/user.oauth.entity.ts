import type { OAuthProviderType } from '@musira/api-interfaces';
import { ChildEntity, Column, Index } from 'typeorm';
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
