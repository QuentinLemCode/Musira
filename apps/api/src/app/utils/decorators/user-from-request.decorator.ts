import { UserPipe } from '../pipes/user.pipe';
import { JwtParamDecorator } from './jwt.decorator';

export const UserFromRequest = (additionalOptions?: any) =>
  JwtParamDecorator(additionalOptions, UserPipe);
