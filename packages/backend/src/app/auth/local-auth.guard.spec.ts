import { AuthModuleOptions, PassportModule } from '@nestjs/passport';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { LocalAuthGuard } from './local-auth.guard';

/**
 * Passport v12's AuthGuard mixin injects the AuthModuleOptions token, which
 * only exists when PassportModule.register() is used. Swagger deep scans
 * (and per-request @UseGuards) instantiate guards through DI, so a bare
 * PassportModule import breaks route exploration and login alike.
 */
describe('LocalAuthGuard (passport wiring)', () => {
  it('registers PassportModule with options so the guard token exists', () => {
    const imports: unknown[] = Reflect.getMetadata('imports', AuthModule) ?? [];
    const passportRegistration = imports.find(
      (entry): entry is { module: unknown; providers?: unknown[] } =>
        typeof entry === 'object' &&
        entry !== null &&
        (entry as { module?: unknown }).module === PassportModule,
    );
    expect(passportRegistration).toBeDefined();
    expect(passportRegistration?.providers ?? []).toContainEqual({
      provide: AuthModuleOptions,
      useValue: {},
    });
  });

  it('instantiates AuthGuard-based guards when the token is provided', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({})],
      providers: [LocalAuthGuard],
    }).compile();
    expect(module.get(LocalAuthGuard)).toBeDefined();
    await module.close();
  });
});
