import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/user.model';
import { firstValueFrom, Observable } from 'rxjs';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

interface MailService {
    sendMail(data: { to: string; subject: string; html: string }): Observable<any>;
}
  
@Injectable()
export class AuthService implements OnModuleInit {
    private mailService: MailService;
    constructor(
        private readonly prismaService: PrismaService,
        private userService: UserService,
        private jwtService: JwtService,
        @Inject('MAIL_SERVICE') private readonly client: ClientGrpc
    ) {}
      
    onModuleInit() {
        this.mailService = this.client.getService<MailService>('MailService');
    }

    async register(registerDto: RegisterDto): Promise<any> {
        const createUser = new User();
        createUser.firstName = registerDto.firstName;
        createUser.lastName = registerDto.lastName;
        createUser.email = registerDto.email;
        createUser.username = registerDto.username;
        createUser.phoneNumber = registerDto.phoneNumber;
        createUser.bio = registerDto.bio;
        createUser.birthday = registerDto.birthday;
        createUser.password = await bcrypt.hash(registerDto.password, 10);
        createUser.status = 'active';
        createUser.createdAt = new Date();
        createUser.updatedAt = new Date();

        const user = await this.userService.createUser(createUser);

        return {
            token: this.jwtService.sign({email: user.email, username: user.username})
        }
       
    }


    async login(loginDto: LoginDto) : Promise<any> {
        const { email, username, password } = loginDto;
        const user = await this.prismaService.user.findUnique({
            where: {email, username}
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const validatePassword = await bcrypt.compare(password, user.password);
        if (!validatePassword) {
            throw new NotFoundException('Invalid password');
        }

        if (user.isTwoFAEnabled) {

            const tempToken = this.jwtService.sign(
                { id: user.id, isTwoFAVerification: true },
                { expiresIn: '10m' } 
            );

            return {
              requires2FA: true,
              userId: user.id,
              message: '2FA code required',
              tempToken: tempToken
            };
        }

        const token = this.jwtService.sign({id: user.id, email: user.email, username: user.username})
        return {token}

    }


    async sendPasswordResetEmail(email: string) {
        const user = await this.prismaService.user.findUnique({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const token = this.jwtService.sign(
            { email },
            { expiresIn: '15m' }
        );

        const resetLink = `https://chainchat.com/reset-password?token=${token}`;
        const emailBody = `<p>Bonjour,</p>  
        <p>Click here to reset your password:</p>
        <a href="${resetLink}">Réinitialiser</a>`;
    
        try {            
            const mailRequest = {
                to: email,
                subject: 'Reset Password',
                html: emailBody
            };
            
            const response = await firstValueFrom(
                this.mailService.sendMail(mailRequest)
            ).catch(error => {
                console.error('Erreur gRPC détaillée:', {
                    code: error.code,
                    details: error.details,
                    metadata: error.metadata
                });
                throw error;
            });
            
            return response;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du mail de réinitialisation:', error);
            throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
        }
    }

    
    async resetPassword(token: string, password: string, confirmPassword: string) {
        try {
          if (password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
          }
      
          const decoded = this.jwtService.verify(token);
          const user = await this.prismaService.user.findUnique({
            where: { email: decoded.email },
          });
      
          if (!user) {
            throw new NotFoundException('User not found');
          }
      
          const hashedPassword = await bcrypt.hash(password, 10);
      
          await this.prismaService.user.update({
            where: { email: decoded.email },
            data: { password: hashedPassword },
          });
      
          return { status: 'success', message: 'Password reset successfully' };
        } catch (err) {
          throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }


      async generateTwoFASecret(authHeader: string) {
        console.log('authHeader:', authHeader);
        const token = authHeader?.split(' ')[1];
        if (!token) {
          throw new RpcException('Invalid token');
        }
    
        let decoded;
        try {
          decoded = this.jwtService.verify(token);
        } catch (err) {
          throw new RpcException('Invalid or expired token');
        }
    
        const userId = decoded.id;
    
        const user = await this.userService.findUserById(userId);
        if (!user) {
          throw new RpcException('User not found');
        }
    
        const secret = speakeasy.generateSecret({
          name: `ChainChat (${user.email})`,
        });
    
        await this.userService.enableTwoFA(userId, secret.base32);
    
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
        return {
          secret: secret.base32,
          qrCode,
        };
      }

      async verifyTwoFA(tokenJwt: string, code: string) {
        let decoded;
        try {
          decoded = this.jwtService.verify(tokenJwt);
        } catch (err) {
          throw new RpcException('Invalid or expired token');
        }
    
        const userId = decoded.id;
        const user = await this.userService.findUserById(userId);
        if (!user || !user.isTwoFAEnabled || !user.twoFASecret) {
          throw new UnauthorizedException('2FA is not enabled for this user');
        }
    
        const isValid = speakeasy.totp.verify({
          secret: user.twoFASecret,
          encoding: 'base32',
          token: code,
          window: 1, 
        });
    
        if (!isValid) {
          throw new UnauthorizedException('Invalid 2FA code');
        }
        const token = this.jwtService.sign({ id: user.id, email: user.email });

        return { success: true, message: '2FA verification successful' , token };
      }
      

}
