import { Controller, Post, Body } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/signup
  @Post('/signup')
  async signup(@Body() input: AuthDto) {
    return this.authService.createUser(input);
  }
}
