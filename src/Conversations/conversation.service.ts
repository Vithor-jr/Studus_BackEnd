import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async createConversation(userId: number, title?: string) {
    const existingUser = await this.prisma.user.findUnique({where:{id:userId}})
    
    if(!existingUser){
      throw new BadRequestException('Usuário não existe')
    }
    return this.prisma.conversation.create({
      data: { userId, title },
    });
  }

  async getUserConversations(userId: number) {
    const existingUser = await this.prisma.user.findUnique({where:{id:userId}})
    
    if(!existingUser){
      throw new BadRequestException('Usuário não existe')
    }
    
    return this.prisma.conversation.findMany({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveMessage(conversationId: number, role: 'user' | 'bot', content: string) {
    return this.prisma.message.create({
      data: { conversationId, role, content },
    });
  }

  async getMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
