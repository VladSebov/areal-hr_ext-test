import {
  Controller,
  Post,
  Get,
  Request,
  UseGuards,
  HttpStatus,
  HttpCode,
  InternalServerErrorException
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';

@Controller('auth')
export class AuthController {

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
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

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    req.logout((err) => {
      if (err) throw new InternalServerErrorException('Logout failed');
    });

    req.session.destroy((err) => {
      if (err) {
        throw new InternalServerErrorException('Could not destroy session');
      }
    });

    req.res.clearCookie('connect.sid');

    return { message: 'Session destroyed' };
  }
}