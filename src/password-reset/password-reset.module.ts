// src/password-reset/password-reset.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordResetService } from './password-reset.service';

@Module({
  imports: [PrismaModule], // Certifique-se de importar o PrismaModule aqui
  providers: [PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
