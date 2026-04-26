import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(login: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByLogin(login);

    if (user && user.passwordHash) {
      const isMatch = await argon2.verify(user.passwordHash, pass);

      if (isMatch) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }

    return null;
  }
}