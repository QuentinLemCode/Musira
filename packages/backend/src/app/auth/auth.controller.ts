import { Body, Controller, Get, Post, Request, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import type { JwtUser } from './types';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Request() req: { user: JwtUser }) {
    return req.user;
  }

  @Post('intent')
  // Public by virtue of JWT guard allowing public routes when auth fails, but we don't mark @Public here
  // because we want the guard to remain permissive: lack of JWT should not block intent persistence
  setIntent(
    @Body('intent') intent: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    if (intent !== 'sessions_creator') {
      return { success: false };
    }
    res.setCookie('login_intent', intent, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 10,
    });
    return { success: true };
  }

  @Get('intent')
  getAndClearIntent(
    @Request() req: { cookies: Record<string, string> },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const intent = req.cookies['login_intent'] ?? null;
    if (intent) {
      res.clearCookie('login_intent', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
      });
    }
    return { intent } as { intent: string | null };
  }
}
