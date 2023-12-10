import { UserPipe } from '../pipes/user.pipe.js';
import { JwtParamDecorator } from './jwt.decorator.js';

export const UserFromRequest = (additionalOptions?: any) =>
  JwtParamDecorator(additionalOptions, UserPipe);
