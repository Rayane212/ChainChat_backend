import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards
  } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response, Request } from 'express';
import { stat } from 'fs';
  
  @ApiTags('auth')
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Register user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @HttpCode(HttpStatus.CREATED)
    @Post('register')
    async register(@Req() request:Request, @Res() response:Response, @Body() registerDto:RegisterDto ) : Promise<any> {
      try {
        const result = await this.authService.register(registerDto);
        return response.status(200).json({
          status:'success',
          message: 'User successfully registered',
          result: result
        });
      }
      catch (err) {
        console.log(err);
        return response.status(500).json({
          status:'error',
          message: 'Internal server error',
        });
      }
    }
  
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 200, description: 'Successful login' })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Req() request:Request, @Res() response:Response, @Body() loginDto:LoginDto ) : Promise<any> {
      try {
        const result = await this.authService.login(loginDto);
        return response.status(200).json({
          status:'success',
          message: 'User successfully logged in',
          result: result
        });
      }
      catch (err) {
        return response.status(500).json({
          status:'error',
          message: 'Internal server error',
        });
      }
    }
  }