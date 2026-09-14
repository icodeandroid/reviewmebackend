import {
  IsString,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  auth0Id!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  picture?: string;
}