import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma.service';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/user.model';

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private userService: UserService,
        private jwtService: JwtService) {}

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
}
