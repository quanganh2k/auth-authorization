import { Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getListUser(): Promise<Omit<Users, 'password'>[]> {
    const listUser = await this.prisma.users.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return listUser;
  }

  async getUserById(id: number): Promise<Users> {
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    delete user.password;

    return user;
  }

  async getUserByEmail(email: string): Promise<Users> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    return user;
  }
}
