import { Injectable, ConflictException, NotFoundException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import FormData from 'form-data'; // Alterado aqui
import axios from 'axios';
import { UpdateUserDto } from './dto/update-user.dto';

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
    try {
      console.log('Email DTO: ', createUserDto.email)
      console.log('telefone DTO: ', createUserDto.phone)
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: createUserDto.email.toLowerCase() },
            { phone: createUserDto.phone },
          ],
        },
      });
  
      if (existingUser) {
        let duplicatedFields = [];

        if (existingUser.email === createUserDto.email.toLowerCase()) {
          duplicatedFields.push('E-mail');
        }
        if (existingUser.phone === createUserDto.phone) {
          duplicatedFields.push('Telefone');
        }
      
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message: 'Os seguintes campos já estão cadastrados: ' + duplicatedFields.join(', '),
          fields: duplicatedFields,
        });
      }
  
      // Criar o usuário se o e-mail e o telefone não estiverem duplicados
      const data: Prisma.UserCreateInput = {
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        password: await bcrypt.hash(createUserDto.password, 10),
      };
  
      const createdUser = await this.prisma.user.create({ data });
  
      return {
        ...createdUser,
        password: undefined,
      };
    } catch (error) {
      // Capturar a exceção e reformatar a mensagem de erro
      if (error instanceof ConflictException) {
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message: error.message,
          fields: error.message.split(': ')[1].split(', '), // Extrair os campos duplicados
        });
      } else {
        console.log('Erro ao criar usuário:', error);
        throw new InternalServerErrorException('Erro interno ao criar usuário.');
      }
    }
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    console.log(`userId: ${userId}, newPassword: ${newPassword}`);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    console.log(`Senha atualizada com sucesso para o usuário ${updatedUser.email}`);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

   async uploadImage(file: Express.Multer.File): Promise<string> {
    const formData = new FormData();

    formData.append('image', file.buffer.toString('base64'));
    formData.append('type', 'base64');
    formData.append('privacy', 'hidden');

    try {
      const response = await axios.post('https://api.imgur.com/3/image', formData, {
        headers: {
          'Authorization': 'Client-ID 2f76e105ad46168',
          ...formData.getHeaders(),
        },
      });
      return response.data.data.link;
    } catch (error) {
      console.error('Erro ao fazer upload para o Imgur:', error);
      throw new InternalServerErrorException('Erro interno ao fazer upload da imagem.');
    }
  }

  // Função para atualizar a URL da foto do perfil do usuário no banco de dados
  async updateUserPhoto(userId: number, photoUrl: string): Promise<void> {
    const userIdInt = +userId;

    await this.prisma.user.update({
      where: { id: userIdInt },
      data: { photoUrl: photoUrl },
    });
  }

  async getUserPhotoUrl(userId: number): Promise<{ photoUrl: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { photoUrl: true },
    });
  
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }
  
    return { photoUrl: user.photoUrl };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userId = +id;

    const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
    const existingDate = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: updateUserDto.email.toLowerCase() },
            { phone: updateUserDto.phone },
          ],
          NOT: { id: userId },
        },
      });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    } else if (existingDate) {
        let duplicatedFields = [];

        if (existingDate.email === updateUserDto.email.toLowerCase()) {
          duplicatedFields.push('E-mail');
        }
        if (existingDate.phone === updateUserDto.phone) {
          duplicatedFields.push('Telefone');
        }
      
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          message: 'Os seguintes campos já estão cadastrados: ' + duplicatedFields.join(', '),
          fields: duplicatedFields,
        });
    } else {
      const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    }); 
    return updatedUser;
   }
  }
}
