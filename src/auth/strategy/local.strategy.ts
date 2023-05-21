import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthDto } from '../dto/auth.dto';
import { Users } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(input: AuthDto): Promise<Users> {
    const user = await this.authService.validateUser(input);

    if (!user) {
      throw new UnauthorizedException('incorrect Credential');
    }
    return user;
  }
}
