import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from './errors/unauthorized.error';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(loginDto: LoginDto): Promise<UserToken> {
    const { email, password } = loginDto;
  
    const user = await this.prisma.user.findUnique({ where: { email } });
  
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  
    const payload: UserPayload = {
      sub: user.id,
      email: user.email.toLowerCase(),
      name: user.name,
      username: user.username,
      phone: user.phone,
    };
  
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const user = await this.userService.findByEmail(email.toLowerCase());
  
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado.');
    }
  
    await this.userService.updatePassword(user.id, newPassword);
  }
  
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email.toLowerCase());
  
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`Tentativa de validação do usuário ${email}...`);
  
      if (isPasswordValid) {
        return {
          ...user,
          email:user.email.toLowerCase(),
          password: undefined,
        };
      }
    }
  
    console.log(`Falha na autenticação para o usuário ${email}.`);
    return null;
  }
}