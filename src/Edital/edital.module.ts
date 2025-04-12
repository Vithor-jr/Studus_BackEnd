import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { EditalController} from "./edital.controller";
import { EditalService } from "./edital.service";

@Module({
	imports: [PrismaModule],
	controllers: [EditalController],
	providers: [EditalService],
	exports: [EditalService]
})

export class EditalModule {}