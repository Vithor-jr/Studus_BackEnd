import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { SessionsController } from "./sessions.controller";
import { SessionService } from "./sessions.service";

@Module({
	imports: [PrismaModule],
	controllers: [SessionsController],
	providers: [SessionService],
	exports: [SessionService]
})

export class SessionModule {}