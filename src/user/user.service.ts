import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se já existe um usuário com o mesmo e-mail
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado');
    }

    // Criar o usuário se o e-mail não estiver duplicado
    const data: Prisma.UserCreateInput = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    };

    const createdUser = await this.prisma.user.create({ data });

    return {
      ...createdUser,
      password: undefined,
    };
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    console.log(`userId: ${userId}, newPassword: ${newPassword}`);

    // Atualizar a senha no banco de dados
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    console.log(`Senha atualizada com sucesso para o usuário ${updatedUser.email}`);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
