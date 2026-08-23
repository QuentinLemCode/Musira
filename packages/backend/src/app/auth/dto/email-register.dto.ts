import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class EmailRegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username!: string;
}
