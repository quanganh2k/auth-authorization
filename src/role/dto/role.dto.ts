import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class RoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class EditRole extends PartialType(RoleDto) {}
