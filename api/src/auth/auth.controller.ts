import {
  Controller,
  Post,
  Get,
  Request,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
  InternalServerErrorException
} from '@nestjs/common';
import type { Response } from 'express';
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
  async logout(@Request() req, @Res() res: Response) {
    req.logout((err) => {
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Passport logout error' });
      }

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Session destruction error' });
        }

        res.clearCookie('connect.sid');
        return res.json({ message: 'Logout successful' });
      });
    });
  }
}