import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.model';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, user: number) => void): void {
    done(null, user.id);
  }

  async deserializeUser(userId: number, done: (err: Error | null, user: User | null) => void): Promise<void> {
    try {
      const user = await this.usersService.findOne(userId);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}