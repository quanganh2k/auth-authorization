import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EditRole, RoleDto } from './dto/role.dto';
import { Roles, UserRole } from '@prisma/client';
import { CreateUserRoleDto } from './dto/createUserRole.dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async addRole(body: RoleDto): Promise<Roles> {
    const role = await this.prisma.roles.create({
      data: body,
    });

    return role;
  }

  async editRole(id: string, body: EditRole): Promise<Roles> {
    const role = await this.prisma.roles.update({
      where: {
        id: +id,
      },
      data: body,
    });

    return role;
  }

  async deleteRole(id: number): Promise<Roles> {
    const role = await this.prisma.roles.delete({
      where: { id },
    });

    return role;
  }

  async getListRoles(): Promise<Roles[]> {
    const listRoles = await this.prisma.roles.findMany();

    return listRoles;
  }

  async getRoleByName(name: string): Promise<Roles> {
    const role = await this.prisma.roles.findUnique({
      where: { name },
    });

    return role;
  }

  async getRoleById(id: string): Promise<Roles> {
    const role = await this.prisma.roles.findUnique({
      where: {
        id: +id,
      },
    });

    return role;
  }

  async addUserRole(body: CreateUserRoleDto[]): Promise<{ count: number }> {
    const response = await this.prisma.userRole.createMany({
      data: body,
    });

    return response;
  }

  async deleteUserRole(listIds: number[]): Promise<{ count: number }> {
    return this.prisma.userRole.deleteMany({
      where: {
        id: {
          in: listIds,
        },
      },
    });
  }

  async changeUserRole(id: number, roleId: number): Promise<UserRole> {
    const response = await this.prisma.userRole.update({
      where: {
        id,
      },
      data: {
        roleId,
      },
    });

    return response;
  }

  async getListUserRole(userId: number): Promise<UserRole[]> {
    const response = await this.prisma.userRole.findMany({
      where: {
        userId,
      },
    });

    return response;
  }
}
