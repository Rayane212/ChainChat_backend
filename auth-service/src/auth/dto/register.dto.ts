import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsString()
  bio: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiPropertyOptional()
  birthday: Date;
}