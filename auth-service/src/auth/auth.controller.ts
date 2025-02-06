import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post
  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { MessagePattern, Payload } from '@nestjs/microservices';

  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService,
                private readonly jwtService: JwtService) {}

    @MessagePattern('auth.register')  
    async register(@Payload() data: RegisterDto) {
      try {
        const result = await this.authService.register(data);
        return {
          status: 'success',
          message: 'User successfully registered',
          result: result
        };
      } catch (err) {
        return {
          status: 'error',
          message: 'Internal server error',
          error: err.message
        };
      }
    }
  
    @MessagePattern('auth.login')  // Pattern modifié
    async login(@Payload() data: LoginDto) {
      try {
        const result = await this.authService.login(data);
        return {
          status: 'success',
          message: 'User successfully logged in',
          result: result
        };
      } catch (err) {
        return {
          status: 'error',
          message: 'Internal server error',
          error: err.message
        };
      }
    }

    @MessagePattern('auth.validate-token')  
    async validateToken(@Payload() data: {token : string}): Promise<any> {
      try {
        const decoded = await this.jwtService.verify(data.token, {
          secret: process.env.JWT_SECRET,
        });
        return { 
          status: 'success',
          valid: true,
          decoded 
        };
      } catch (error) {
        return { 
          status: 'error',
          valid: false, 
          error: error.message 
        };
      }
    }

  }