import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { UpdateSessionDto } from "./dto/update-session-dto";
import { CreateSessionDto } from "./dto/create-session-dto";

@Injectable()
export class SessionService {
	constructor (private prisma: PrismaService) {}
	//~~~~~~~CRUD~~~~~~~~~~
	async createStudySession(createStudySessionDto: CreateSessionDto) {
    const { name, categoryId, duration, userId, start, end } = createStudySessionDto

		if (duration <= 0) {
      throw new BadRequestException('A duração deve ser maior que zero.');
		}

		const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });

		if (!existingUser) {
      throw new BadRequestException('Usuário não encontrado');
		}

    try {
      return await this.prisma.studySession.create({
        data: {
          name,
					categoryId,
          duration,
					endAt:end,
					startAt:start,
          userId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao criar a sessão de estudo: ${error}`);
    }
	}

	async updateSession(userId : number, updateSessionDto: UpdateSessionDto){
		const {name, duration, sessionId, categoryId} = updateSessionDto;

		const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
		const existingSession = await this.prisma.studySession.findUnique({ where: { id: sessionId } });

		if (!existingSession) {
      throw new BadRequestException('Sessão não encontrada');
		}

		if (!existingUser) {
      throw new BadRequestException('Usuário não encontrado');
		}

		return this.prisma.studySession.update({
			where: {id: sessionId},
			data: {name, duration, categoryId}
		})		
	}

	async completSession(userId: number, sessionId: number){

		const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
		const existingSession = await this.prisma.studySession.findUnique({ where: { id: sessionId } });

		if (!existingSession) {
      throw new BadRequestException('Sessão não encontrada');
		}

		if (!existingUser) {
      throw new BadRequestException('Usuário não encontrado');
		}

		return this.prisma.studySession.update({
			where: {id: sessionId},
			data: {endAt: new Date().toISOString(),}
		})		
	}

	async deleteSession(userId: number, sessionId: number){
		const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
		const existingSession = await this.prisma.studySession.findUnique({ where: { id: sessionId } });

		if (!existingSession) {
      throw new BadRequestException('Sessão não encontrada');
		}

		if (!existingUser) {
      throw new BadRequestException('Usuário não encontrado');
		}
		
		return await this.prisma.studySession.delete({
			where: {
				id:sessionId
			}
		})
	}

	async getSessionByUser(userId:number){
		const existingUser = await this.prisma.user.findUnique({ where: { id: userId } }); 
		
		if (!existingUser) {
      throw new BadRequestException('Usuário não encontrado');
		}

		return await this.prisma.studySession.findMany({
			where:{userId:userId},
			include:{category:true}
		})
	}

	async getSessionTodayByUser(userId: number) {
		const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
	
		if (!existingUser) {
			throw new BadRequestException('Usuário não encontrado');
		}
	
		// Define o fuso horário de Manaus
		const timeZone = 'America/Manaus';
	
		// Obtém a data atual no fuso horário de Manaus
		const now = new Date();
		const today = new Date(new Date().toLocaleString("en-US", { timeZone }));
		today.setHours(4, 0, 0, 0);
	
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);
		tomorrow.setHours(4, 0, 0, 0);
	
		// Converte para UTC
		const todayUTC = new Date(today.toLocaleString("en-US", { timeZone: 'UTC' }));
		const tomorrowUTC = new Date(tomorrow.toLocaleString("en-US", { timeZone: 'UTC' }));
	
		console.log(todayUTC.toISOString(), tomorrowUTC.toISOString());
	
		return await this.prisma.studySession.findMany({
			where: {
				userId: userId,
				startAt: {
					gte: todayUTC.toISOString(),
					lte: tomorrowUTC.toISOString(),
				},
			},
			include: { category: true },
		});
	}
	
	async getSessionById(sessionId: number) {
	try {
		const existingSession = await this.prisma.studySession.findUnique({
			where: {
				id: sessionId, // Use o ID da sessão de estudo diretamente
			},
			include:{
				category: true
			}
		});

		if (!existingSession) {
			throw new BadRequestException('Sessão de estudo não encontrada');
		}

		return existingSession;
	} catch (error) {
		throw new InternalServerErrorException(`Erro ao buscar a sessão de estudo: ${error}`);
	}
	}                                                          

	async getWeeklySessionDurations(userId: number): Promise<{ value: number; label: string; frontColor: string }[]> {
    const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
        throw new BadRequestException("Usuário não encontrado");
    }

    const now = new Date();
    const offsetHours = -4;
    const localTime = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);

    // Definir o início da semana (segunda-feira) no fuso horário de Manaus
    const startOfWeek = new Date(localTime);
    startOfWeek.setDate(localTime.getDate() - localTime.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Definir o final da semana (domingo) no fuso horário de Manaus
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    // Consultar as sessões do usuário dentro do intervalo da semana
    const userSessions = await this.prisma.studySession.findMany({
        where: {
            userId,
            startAt: {
                gte: startOfWeek.toISOString(),
                lte: endOfWeek.toISOString(),
            },
        },
        select: { duration: true, startAt: true },
    });

    // Calcular as durações semanais por dia da semana
    const weeklyDurations: { [day: string]: number } = {
        seg: 0,
        ter: 0,
        qua: 0,
        qui: 0,
        sex: 0,
        sáb: 0,
        dom: 0,
    };

    userSessions.forEach((session) => {
        const sessionDay = new Date(session.startAt).getDay();
        switch (sessionDay) {
            case 0:
                weeklyDurations["dom"] += session.duration / 60;
                break;
            case 1:
                weeklyDurations["seg"] += session.duration / 60;
                break;
            case 2:
                weeklyDurations["ter"] += session.duration / 60;
                break;
            case 3:
                weeklyDurations["qua"] += session.duration / 60;
                break;
            case 4:
                weeklyDurations["qui"] += session.duration / 60;
                break;
            case 5:
                weeklyDurations["sex"] += session.duration / 60;
                break;
            case 6:
                weeklyDurations["sáb"] += session.duration / 60;
                break;
        }
    });

    // Formatar os dados para retorno
    const data = [
        { value: weeklyDurations["seg"], label: 'Seg', frontColor: '#FAC9B9' },
        { value: weeklyDurations["ter"], label: 'Ter', frontColor: '#D6D0E7' },
        { value: weeklyDurations["qua"], label: 'Qua', frontColor: '#D3E6C1' },
        { value: weeklyDurations["qui"], label: 'Qui', frontColor: '#FFD0A0' },
        { value: weeklyDurations["sex"], label: 'Sex', frontColor: '#FAC9B9' },
        { value: weeklyDurations["sáb"], label: 'Sáb', frontColor: '#D6D0E7' },
        { value: weeklyDurations["dom"], label: 'Dom', frontColor: '#D3E6C1' },
    ];

    return data;
}


}