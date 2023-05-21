import * as argon from 'argon2';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(input: AuthDto) {
    const hashedPassword = await argon.hash(input.password);

    try {
      return await this.prisma.users.create({
        data: {
          email: input.email,
          password: {
            create: {
              userPassword: hashedPassword,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Email has been used');
      }
      throw error;
    }
  }
}
