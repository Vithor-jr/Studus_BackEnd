// app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';;
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

import { PasswordResetModule } from './password-reset/password-reset.module';
import { AuthModule } from './auth/auth.module'
import { SessionModule } from './Sessions/sessions.module';
import { ActivityModule } from './activity/activity/activity.module';
import { UserModule } from './user/user.module';
import { EditalModule } from './Edital/edital.module';
import { MoodModule } from './Mood/mood/mood.module';
import { ConversationModule } from './Conversations/conversation.module';

@Module({
  imports: [
    UserModule, 
    AuthModule,
    MoodModule,
    ActivityModule,
    PasswordResetModule,
    SessionModule,
    EditalModule,
    ConversationModule
  ],
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
