import { Controller, Get } from '@nestjs/common';
import { Public } from '../../auth/public-routes.decorator';

@Controller('health')
export class HealthController {
  @Get('')
  @Public()
  public get() {
    return 'OK';
  }
}
