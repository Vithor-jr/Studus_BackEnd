// src/auth/auth.controller.ts

import { Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthRequest } from './models/AuthRequest';
import { IsPublic } from './decorators/is-public.decorator';
import { PasswordResetService } from '../password-reset/password-reset.service';
import * as bcrypt from 'bcrypt';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }

  @IsPublic()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Request() req: AuthRequest) {
    try {
      const { email, code } = req.body;
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Define a expiração para 15 minutos

      // Criação da solicitação de redefinição de senha e envio de e-mail
      await this.passwordResetService.createPasswordReset(email, expiresAt);

      return { message: `Código enviado com sucesso.` };
    } catch (error) {
      return { error: 'Erro ao solicitar redefinição de senha.' };
    }
  }

  @IsPublic()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Request() req: AuthRequest) {
    try {
      const { email, code, newPassword } = req.body;

      // Verifica se o código fornecido é válido
      const passwordReset = await this.passwordResetService.findPasswordResetByEmailAndCode(email, code);

      if (passwordReset) {
        // Hash da nova senha antes de salvar no banco de dados
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Lógica para atualizar a senha no banco de dados
        await this.authService.updatePassword(email, hashedPassword);

        // Exclusão da entrada de redefinição de senha após a conclusão do processo
        await this.passwordResetService.deletePasswordReset(passwordReset.id);

        return { message: 'Senha redefinida com sucesso.' };
      } else {
        return { error: 'Código inválido ou expirado.' };
      }
    } catch (error) {
      return { error: 'Erro ao redefinir a senha.' };
    }
  }
}
