// app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UserModule } from './user/user.module';
import { PasswordResetModule } from './password-reset/password-reset.module'; // Certifique-se de importar o PasswordResetModule
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [UserModule, AuthModule, PasswordResetModule], // Certifique-se de importar o PasswordResetModule aqui
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
