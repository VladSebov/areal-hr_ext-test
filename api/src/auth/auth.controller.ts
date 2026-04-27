import { Controller, Post, Get, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('auth')
export class AuthController {

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return {
      message: 'Login successfully',
      user: req.user
    };
  }

  @UseGuards(AuthenticatedGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('logout')
  async logout(@Request() req) {
    req.session.destroy();
    return { message: 'Session destroyed' };
  }
}