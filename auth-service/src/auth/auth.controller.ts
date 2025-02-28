import {
  Controller,
  Logger,
  Headers
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: RegisterDto) {
    try {
      const result = await this.authService.register(data);
      return {
        status: 'success',
        message: 'User successfully registered',
        result,
      };
    } catch (err) {
      this.logger.error(`Error registering user: ${err.message}`);
      throw new RpcException(err.message || 'Internal server error');
    }
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: LoginDto) {
    try {
      const result = await this.authService.login(data);
      return {
        status: 'success',
        message: 'User successfully logged in',
        result,
      };
    } catch (err) {
      this.logger.error(`Error logging in: ${err.message}`);
      throw new RpcException(err.message || 'Internal server error');
    }
  }

  @MessagePattern('auth.validate-token')
  async validateToken(@Payload() data: { token: string }): Promise<any> {
    try {
      const decoded = await this.jwtService.verify(data.token, {
        secret: process.env.JWT_SECRET,
      });
      return {
        status: 'success',
        valid: true,
        decoded,
      };
    } catch (error) {
      this.logger.warn(`Invalid token: ${error.message}`);
      return {
        status: 'error',
        valid: false,
        error: error.message,
      };
    }
  }

  @MessagePattern('auth.send-mail-forget-password')
  async sendMailForgetPassword(@Payload() data: { email: string }) {
    this.logger.log(`Sending password reset email to: ${data.email}`);

    try {
      const result = await this.authService.sendPasswordResetEmail(data.email);

      if (!result.success) {
        throw new RpcException(result.message);
      }

      return {
        status: 'success',
        message: 'Password reset email sent successfully',
      };
    } catch (err) {
      this.logger.error(`Error sending password reset email: ${err.message}`);
      throw new RpcException(err.message || 'Failed to send password reset email');
    }
  }

  @MessagePattern('auth.reset-password')
  async resetPassword(@Payload() data: { token: string, password: string, confirmPassword: string }) {
    this.logger.log(`Resetting password for token: ${data.token}`);

    try {
      const result = await this.authService.resetPassword(data.token, data.password, data.confirmPassword);

      if (!result.status) {
        throw new RpcException(result.message);
      }

      return {
        status: 'success',
        message: 'Password reset successfully',
      };
    } catch (err) {
      this.logger.error(`Error resetting password: ${err.message}`);
      throw new RpcException(err.message || 'Failed to reset password');
    }
  }

  @MessagePattern('auth.generate-2fa-secret')
  async generateTwoFASecret(@Payload() authHeader: string) {
    try {
      return await this.authService.generateTwoFASecret(authHeader);
    } catch (err) {
      this.logger.error(`Error generating 2FA secret: ${err.message}`);
      throw new RpcException(err.message || 'Failed to generate 2FA secret');
    }
  }

  @MessagePattern('auth.verify-2fa')
  async verifyTwoFA(@Payload() data: {token: string, code: string }) {
    try {
      return await this.authService.verifyTwoFA(data.token,data.code);
    } catch (err) {
      this.logger.error(`2FA verification failed: ${err.message}`);
      throw new RpcException(err.message || 'Failed to verify 2FA');
    }
  }

  @MessagePattern('auth.disable-2fa')
  async disableTwoFA(@Payload() data: { token: string }) {
    try {
      return await this.authService.disableTwoFA(data.token);
    } catch (err) {
      this.logger.error(`Error disabling 2FA: ${err.message}`);
      throw new RpcException(err.message || 'Failed to disable 2FA');
    }
  }

}