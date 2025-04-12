import { Module } from "@nestjs/common";
import { ConversationsController, MessagesController } from "./conversation.controller";
import { ConversationsService } from "./conversation.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
	imports:[PrismaModule],
	providers:[ConversationsService],
	controllers:[ConversationsController, MessagesController]
})

export class ConversationModule {}