import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/constants';
import { Users } from '@prisma/client';
import { SignInDto } from './dto/signin.dto';
import { cloneDeep } from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signUp(body: SignUpDto): Promise<{ message: string }> {
    const { email, password, firstName, lastName } = body;

    const foundUser = await this.prisma.users.findUnique({
      where: { email },
    });

    if (foundUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    await this.prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: Roles.USER,
      },
    });

    return { message: 'Sign up successfully' };
  }

  async signIn(body: SignInDto): Promise<{
    message: string;
    accessToken: string;
    user: Omit<Users, 'password'>;
  }> {
    const { email, password } = body;

    const foundUser = await this.prisma.users.findUnique({
      where: {
        email,
      },
      include: {
        UserRole: true,
      },
    });

    if (!foundUser) {
      throw new BadRequestException('User does not exist');
    }

    const isMatchedPassword = await this.comparePassword({
      password,
      hash: foundUser.password,
    });

    if (!isMatchedPassword) {
      throw new BadRequestException('Invalid email or password');
    }

    const nextUser = cloneDeep(foundUser);

    delete nextUser.password;

    const accessToken = await this.signAccessToken(nextUser);

    if (!accessToken) {
      throw new ForbiddenException('Missing access token');
    }

    return {
      message: 'Login successfully',
      accessToken,
      user: nextUser,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;

    return bcrypt.hash(password, saltOrRounds);
  }

  async comparePassword(body: {
    password: string;
    hash: string;
  }): Promise<boolean> {
    return bcrypt.compare(body.password, body.hash);
  }

  async signAccessToken(user: Users): Promise<string> {
    const payload = {
      user,
    };

    const accessToken = await this.jwt.signAsync(payload);

    return accessToken;
  }
}
