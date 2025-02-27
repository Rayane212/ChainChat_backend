import { Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/user.model';
import { firstValueFrom, Observable } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

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
        console.log('Service mail connecté');
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
        return {
            token: this.jwtService.sign({id: user.id, email: user.email, username: user.username}) 
        }

    }


    async sendPasswordResetEmail(email: string) {
        const resetLink = `https://chainchat.com/reset-password?token=${this.jwtService.sign({email})}`;
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

}
