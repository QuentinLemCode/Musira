import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';

@ChildEntity()
export class EmailUser extends User {
  @Column({
    default: 0,
  })
  loginTries: number;

  @Column({
    default: false,
  })
  locked: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  password: string | null;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  salt: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  refresh_token_id: string | null;
}
