// src/auth/auth.controller.ts

import { Controller, HttpCode, HttpStatus, Post, Request, UseGuards, Get, Req, Res, Body} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthRequest } from './models/AuthRequest';
import { IsPublic } from './decorators/is-public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { PasswordResetService } from '../password-reset/password-reset.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ResetPasswordGuard } from './guards/reset-password.guard';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly prisma: PrismaService
  ) {}

  @IsPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { access_token } = await this.authService.login(loginDto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.send({ message: 'Login realizado com sucesso', access_token});
  }

  @Post('login_web')
  @HttpCode(HttpStatus.OK)
  async loginWeb(@Body() loginDto: LoginDto, @Res() res: Response) {
    const token = await this.authService.login(loginDto);

    res.cookie('auth_token', token.access_token, {
      httpOnly: true, // Protege contra ataques XSS
      secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
      sameSite: 'strict', // Evita CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return res.send({ message: 'Login realizado com sucesso!' });
  }

  @IsPublic()
  @UseGuards(ResetPasswordGuard)
  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  async verifyResetCode(@Request() req) {
    const { email, code } = req.body;
    return await this.passwordResetService.verifyResetCode(email, code);
  }
  
  @IsPublic()
  @UseGuards(ResetPasswordGuard)
  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Request() req) {
    const { email, code, newPassword } = req.body;

    const isValid = await this.passwordResetService.verifyResetCode(email, code);
    if (!isValid.success) {
      return { error: isValid.message };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.authService.updatePassword(email, hashedPassword);

    return { message: 'Senha redefinida com sucesso.' };
  }

  @IsPublic()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Request() req: AuthRequest) {
    try {
      const { email } = req.body;
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); 
  
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
  
      if (!user) {
        return { error: 'Usuário não encontrado.' };
      }
  
      const userId = user.id;
      
      const response = await this.passwordResetService.createPasswordReset(userId, email, expiresAt);
  
      // 🔹 Gerando um token temporário
      const token = jwt.sign({ email, userId }, process.env.JWT_SECRET, {
        expiresIn: '15m',
      });
  
      return { 
        message: `Código enviado com sucesso.`,
        token, // 🔹 Enviando o token para o frontend
        expire: expiresAt,
      };
    } catch (error) {
      return { error: error.message || 'Erro desconhecido ao solicitar redefinição de senha.' };
    }
  }

  @IsPublic()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Request() req: AuthRequest) {
    try {
      const { email, code, newPassword } = req.body;

      const result = await this.passwordResetService.findPasswordResetByEmailAndCode(email, code);

      if (result.success) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.authService.updatePassword(email, hashedPassword);

        return { message: 'Senha redefinida com sucesso.' };
      } else {
        return { error: result.message, code: result.code, email :result.email  };
      }
    } catch (error) {
      return { error: 'Erro ao redefinir a senha.' };
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Inicia o login do Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req, @Res() res) {
    // Lida com o retorno do Google OAuth
    const user = req.user;
    // Redireciona ou responde de acordo com sua lógica
    res.redirect('http://seu-app.com/home');
  }
}
