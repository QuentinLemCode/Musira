import { Inject, Injectable, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public-routes.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(@Inject(Reflector) private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const result = super.canActivate(context);
    if (result instanceof Promise) {
      return result.catch((err) => {
        if (isPublic) {
          return true;
        }
        throw err;
      });
    }
    return result;
  }
}
