import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { EditRole, RoleDto } from './dto/role.dto';
import { isArray } from 'lodash';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Roles as RolesInterface } from '../constants';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @Roles(RolesInterface.ADMIN)
  async getListRole() {
    return this.roleService.getListRoles();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  @Roles(RolesInterface.ADMIN)
  async getRoleDetails(@Param('id') id: string) {
    const role = await this.roleService.getRoleById(id);

    if (!role) {
      throw new NotFoundException();
    }

    return role;
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  @Roles(RolesInterface.ADMIN)
  async addRole(@Body() body: RoleDto) {
    const roleFound = await this.roleService.getRoleByName(body.name);

    if (roleFound) {
      throw new BadRequestException('Role already exists');
    }

    const newRole = await this.roleService.addRole(body);

    return {
      message: 'Create role successfully',
      data: newRole,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(RolesInterface.ADMIN)
  async editRole(@Param('id') id: string, @Body() body: EditRole) {
    const foundRole = await this.roleService.getRoleById(id);

    if (!foundRole) {
      throw new BadRequestException('Role does not exist');
    }

    if (body.name === foundRole.name) {
      return {
        message: 'Edit role successfully',
        data: foundRole,
      };
    }

    const otherRole = await this.roleService.getRoleByName(body.name);

    if (otherRole) {
      throw new BadRequestException('Role already exists');
    }

    const updatedRole = await this.roleService.editRole(id, body);

    return {
      message: 'Edit role successfully',
      data: updatedRole,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(RolesInterface.ADMIN)
  async deleteRole(@Param('id') id: string) {
    const role = await this.roleService.deleteRole(+id);

    return {
      message: 'Delete role successfully',
      data: role,
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Patch('/change-role/:id')
  @Roles(RolesInterface.ADMIN)
  async changeUserRole(
    @Param('id') id: string,
    @Body() body: { roleIds: number[] },
  ) {
    const { roleIds } = body;

    const listRole = await this.roleService.getListRoles();

    const roleIdsValid = roleIds.filter(
      (elm) => listRole.findIndex((el) => el.id === elm) !== -1,
    );

    const listUserRole = await this.roleService.getListUserRole(+id);

    if (isArray(listUserRole) && listUserRole.length === 0) {
      throw new BadRequestException('User does not exist');
    }

    // additional role
    const newUserRole = roleIdsValid.filter(
      (el) => listUserRole.findIndex((elm) => elm.roleId === el) === -1,
    );

    if (newUserRole.length > 0) {
      const bodyAddUserRole = newUserRole.map((elm) => {
        return {
          userId: +id,
          roleId: elm,
        };
      });

      await this.roleService.addUserRole(bodyAddUserRole);
    }

    // delete role
    const userRoleDeleted = listUserRole.filter(
      (elm) => !roleIdsValid.includes(elm.roleId),
    );

    if (userRoleDeleted.length > 0) {
      const listIdDeleted = userRoleDeleted.map((el) => el.id);

      await this.roleService.deleteUserRole(listIdDeleted);
    }

    return {
      message: 'Change role of user succesfully',
    };
  }
}
