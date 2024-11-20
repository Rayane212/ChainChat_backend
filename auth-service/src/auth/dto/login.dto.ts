// login.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, max } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional()
  @IsString()
  username: string;

  @ApiPropertyOptional()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  @Length(8, 20)
  password: string;
}