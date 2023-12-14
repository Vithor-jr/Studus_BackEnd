import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from './errors/unauthorized.error';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(user: User): Promise<UserToken> {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
  
    if (!user) {
      // Trate o caso em que o usuário não existe
      throw new UnauthorizedError('Usuário não encontrado.');
    }
  
    // Atualize a senha no banco de dados
    await this.userService.updatePassword(user.id, newPassword);
  }
  
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    console.log(`Senha do usuário obtida do banco de dados: ${user.password}`);
    console.log(`Senha fornecida durante o login: ${password}`);
  
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(`Tentativa de validação do usuário ${email}...`);
  
      if (isPasswordValid) {
        return {
          ...user,
          password: undefined,
        };
      }
    }
  
    console.log(`Falha na autenticação para o usuário ${email}.`);
    return null;
  }
}