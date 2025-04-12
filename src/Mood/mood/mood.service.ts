import { BadRequestException, Injectable } from '@nestjs/common';
import { DailyMood, Mood, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function ExistingMood(mood: string){
	if(mood === 'TRISTE'){
		return true
	} else if(mood === 'FELIZ') {
		return true
	} else if(mood === 'RAIVA'){
		return true
	} else if(mood === 'NEUTRO'){
		return true
	}

	return false
}

@Injectable()
export class MoodService {
	async createDailyMood(userId: number, mood: Mood): Promise<void> {
		const existingUser = await prisma.user.findUnique({where:{id:userId}})

		if(!existingUser){
			throw new BadRequestException('Usuário não existe')
		}

		const existingMood = ExistingMood(mood)
		
		if(!existingMood){
			throw new BadRequestException('Emoção não encontrada, use: TRISTE, FELIZ, NEUTRO ou RAIVA')
		}

		const dateWithAnticipation = new Date();
		dateWithAnticipation.setHours(dateWithAnticipation.getHours() - 4);

		await prisma.dailyMood.create({
			data: {
				userId,
				mood,
				date: dateWithAnticipation,
			},
		});
  }

  async getWeeklyMoods(userId: number): Promise<DailyMood[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

		const existingUser = await prisma.user.findUnique({where:{id:userId}})

		if(!existingUser){
			throw new BadRequestException('Usuário não existe')
		}


    return prisma.dailyMood.findMany({
      where: {
        userId,
        date: {
          gte: startOfWeek,
        },
      },
    });
	}
}