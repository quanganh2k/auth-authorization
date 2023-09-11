import { IsNotEmpty, IsNumber } from 'class-validator';
import { Roles } from 'src/constants';

export class CreateUserRoleDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  roleId: Roles;
}
