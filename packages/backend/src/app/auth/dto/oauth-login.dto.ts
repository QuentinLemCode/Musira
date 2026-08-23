import { IsIn, IsString, MinLength } from 'class-validator';
import { OAuthProvider, OAuthProviderType } from '../types';

const providerValues = Object.values(OAuthProvider) as string[];

export class OAuthLoginDto {
  @IsIn(providerValues)
  provider!: OAuthProviderType;

  @IsString()
  @MinLength(1)
  code!: string;
}
