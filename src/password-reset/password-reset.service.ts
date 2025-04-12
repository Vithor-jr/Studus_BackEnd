import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  constructor(private prisma: PrismaService) {}

  async createPasswordReset(userId: number, email: string, expiresAt: Date) {
    await this.removePasswordResetByEmail(email);
  
    const code = uuidv4().substring(0, 6);
    const hashedCode = await bcrypt.hash(code, 10);

    await this.prisma.passwordReset.create({
      data: {
        email: email.toLowerCase(),
        code: hashedCode,
        expiresAt,
        user: { connect: { id: userId } },
      },
    });
  
    await this.sendEmail(email, code);
  
    return { code, message: 'Código enviado com sucesso.' };
  }
  
  async verifyResetCode(email: string, code: string) {
    if (!email) {
      throw new Error("Email é obrigatório para verificar o código.");
    }
  
    email = email.toLowerCase();
  
    const resetRequest = await this.prisma.passwordReset.findFirst({
      where: {
        email: email.toLowerCase(),
        expiresAt: { gt: new Date() },
      },
    });
  
    if (!resetRequest) {
      return { success: false, message: 'Código inválido ou expirado.' };
    }
  
    const isValid = await bcrypt.compare(code, resetRequest.code);
    
    if (!isValid) {
      return { success: false, message: 'Código inválido.' };
    }
  
    return { success: true, message: 'Código válido.' };
  }
  
  
  
  async findPasswordResetByEmailAndCode(email: string, code: string) {
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: {
        email: email.toLowerCase(),
        expiresAt: {
          gte: new Date(),
        },
      },
    });
  
    if (passwordReset) {
      const isValidCode = await bcrypt.compare(code, passwordReset.code);
  
      if (isValidCode) {
        await this.deletePasswordReset(passwordReset.id);
  
        return { success: true, email:email.toLowerCase(), code:code, message: 'Código válido. Redefinição de senha permitida.' };
      } else {
        return { success: false, email:email.toLowerCase(), code:code, message: 'Código inválido. Tente novamente.' };
      }
    }
  
    return { success: false, email:email.toLowerCase(), code:code, message: 'Nenhuma solicitação de redefinição de senha encontrada.' };
  }
  

  async deletePasswordReset(id: number) {
    return await this.prisma.passwordReset.delete({
      where: {
        id,
      },
    });
  }

  async sendEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port:465,
      auth: {
        user: 'studusfmm2023@gmail.com',
        pass: 'vrba znvn rdxn jggn',
      },
      secure:true
    });

    const mailOptions = {
      from: 'studusfmm2023@gmail.com',
      to: email,
      subject: 'Código de Redefinição de Senha',
      html: `
      <html>
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet">
          </head>

          <body>
          <div style="background-color: #3B267B; padding:20px">
              <img src="https://i.imgur.com/wrHjP1H.png" alt="Logo da Empresa" style="width: 100%; max-width: 100px; ">
              <h1 style="font-size: 25px; text-align: left; font-family: 'Varela Round', sans-serif; margin-bottom:30px; color: #FFF;">Redefinição de senha</h1>
            <!-- Corpo do e-mail -->
            <div style="
              background-color: #FFF;
              padding: 30px; border-radius: 20px; border: 1px solid #FFFFFF; overflow: hidden"
            >
              <p style="font-size: 16px; text-align: left; font-family: 'Varela Round', sans-serif; color: #000;">
                Olá
              </p>

              <p style="font-size: 16px; text-align: left; font-family: 'Varela Round', sans-serif; color: #000;">
                Você solicitou a redefinição de senha para a sua conta. Abaixo está o código de redefinição de senha:
              </p>

              <div style="border-top: 1px solid #000000;  border-bottom: 1px solid #000000;">
                <p style="font-size: 16px; text-align: left; font-family: 'Varela Round', sans-serif; color: #000;">
                <strong>Código:</strong>
                </p>

                <p style="font-size: 25px; text-align: center; font-family: 'Varela Round', sans-serif; color: #000;">
                  <strong>${code}</strong>
                </p>
              </div>

              <p style="font-size: 16px; text-align: left; font-family: 'Varela Round', sans-serif; color: #000;">
                Este código é válido por um curto período de tempo. Por favor, use-o imediatamente para concluir o processo de redefinição de senha.
              </p>

              <p style="font-size: 16px; text-align: left; font-family: 'Varela Round', sans-serif; color: #000;">
                Se você não solicitou esta redefinição, ignore este e-mail.
              </p>

              <p style="font-size: 16px; text-align: left; font-family: 'Varela Round', sans-serif; color: #000;">
                Atenciosamente,<br/>
                Sua Equipe de Suporte
              </p>
            </div>
            </div>   
          </body>
        </html>
      `,
    };
  
    

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail para ${email}: ${error.message}`);
    }
  }

  async removePasswordResetByEmail(email: string) {
    await this.prisma.passwordReset.deleteMany({
      where: {
        email: email.toLowerCase(),
      },
    });
  }
}