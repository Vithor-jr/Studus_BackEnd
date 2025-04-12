import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversation.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

	@UseGuards(JwtAuthGuard)
  @Post()
  async createConversation(@Body() body: { userId: number; title?: string }) {
    return this.conversationsService.createConversation(body.userId, body.title);
  }

	@UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getUserConversations(@Param('userId') userId: number) {
    return this.conversationsService.getUserConversations(userId);
  }
}

@Controller('messages')
export class MessagesController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async saveMessage(@Body() body: { conversationId: number; role: string; content: string }) {
    return this.conversationsService.saveMessage(body.conversationId, body.role as 'user' | 'bot', body.content);
  }

  @Get(':conversationId')
  async getMessages(@Param('conversationId') conversationId: number) {
    return this.conversationsService.getMessages(conversationId);
  }
}
