import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class EmailLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
