import * as argon from 'argon2';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  async signIn(input: AuthDto): Promise<any> {
    // find user by email include the password for comparison use
    const user = await this.prisma.users.findFirst({
      where: {
        email: input.email,
      },
      include: {
        password: true,
      },
    });

    // if user doesn't exist throw error
    if (!user) throw new ForbiddenException('Incorrect Credentials');

    // compare the password
    const isPasswordMatch = argon.verify(
      user.password[0].userPassword,
      input.password,
    );

    // if password incorect
    if (!isPasswordMatch) throw new ForbiddenException('Incorrect Credentials');

    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  async validateUser(input: AuthDto): Promise<Users | null> {
    const user = await this.prisma.users.findFirst({
      where: {
        email: input.email,
      },
      include: {
        password: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordMatch = argon.verify(
      user.password[0].userPassword,
      input.password,
    );

    if (!isPasswordMatch) {
      return null;
    }

    return user;
  }
}
