import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(private prisma: PrismaService) {}

  async createPasswordReset(email: string, expiresAt: Date) {
    // Remover código antigo associado ao e-mail, se existir
    await this.removePasswordResetByEmail(email);
  
    const code = uuidv4().substring(0, 6); // Gera um código de 6 caracteres
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(code, salt);
  
    await this.prisma.passwordReset.create({
      data: {
        email,
        code: hashedCode,
        expiresAt,
      },
    });
  
    // Enviar e-mail com o código usando Nodemailer
    this.sendEmail(email, code);
  
    this.logger.log(`E-mail enviado com sucesso para: ${email}`);
  
    return { message: 'Código enviado com sucesso. ' };
  }
  
  async findPasswordResetByEmailAndCode(email: string, code: string) {
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        email,
        expiresAt: {
          gte: new Date(),
        },
      },
    });
  
    if (passwordReset) {
      console.log(`Code: ${code}`);
      console.log(`PasswordReset.code: ${passwordReset.code}`);
  
      // Comparação usando o mesmo salt utilizado durante a geração do hash
      const isValidCode = await bcrypt.compare(code, passwordReset.code);
  
      console.log(`A solicitação foi: ${isValidCode}`);
      
      return isValidCode ? passwordReset : null;
    }
  
    return null;
  }  

  async deletePasswordReset(id: number) {
    return this.prisma.passwordReset.delete({
      where: {
        id,
      },
    });
  }

  private async sendEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      // Configurações do seu provedor de e-mail (ex: Gmail)
      service: 'gmail',
      auth: {
        user: 'studusfmm2023@gmail.com',
        pass: 'vrba znvn rdxn jggn',
      },
    });

    const mailOptions = {
      from: 'studusfmm2023@gmail.com',
      to: email,
      subject: 'Código de Redefinição de Senha',
      text: `Olá,\n\nVocê solicitou a redefinição de senha para a sua conta. Abaixo está o código de redefinição de senha:\n\nCódigo: ${code}\n\nEste código é válido por um curto período de tempo. Por favor, use-o imediatamente para concluir o processo de redefinição de senha.\n\nSe você não solicitou esta redefinição, ignore este e-mail.\n\nAtenciosamente,\nSua Equipe de Suporte`,
    };
    

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail para ${email}: ${error.message}`);
    }
  }

  private async removePasswordResetByEmail(email: string) {
    // Remover código antigo associado ao e-mail
    await this.prisma.passwordReset.deleteMany({
      where: {
        email,
      },
    });
  }
}