import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Topic, UserProgress } from '@prisma/client';
import { CreateEditalDto } from './dto/create-edital-dto';

@Injectable()
export class EditalService {
  constructor(private prisma: PrismaService) {}

  async getAllTopics(): Promise<Topic[]> {
    return this.prisma.topic.findMany();
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return this.prisma.userProgress.findMany({
      where: { userId },
      include: { topic: true },
    });
  }

	async getAllTopicsWithProgress(userId: number): Promise<any[]> {
    const topics = await this.prisma.topic.findMany();
    const progress = await this.prisma.userProgress.findMany({
      where: { userId },
    });

    const progressMap = new Map(progress.map(p => [p.topicId, p.checked]));

    return topics.map(topic => ({
      ...topic,
      checked: progressMap.get(topic.id) || false,
    }));
  }

	async getTopicByDiscipline(dicipline:string){
    return this.prisma.topic.findMany({
      where: { discipline: dicipline },
    });
  }

	async getTopicByVestibular(vestibular:string){
    return this.prisma.topic.findMany({
      where: { vestibular: vestibular },
    });
  }

	async createTopic(createTopicDto: CreateEditalDto): Promise<Topic> {
		return this.prisma.topic.create({
			data: {
				name: createTopicDto.name,
				vestibular: createTopicDto.vestibular,
				discipline: createTopicDto.discipline,
        important: createTopicDto.important
			},
		});
	}

	async delete(topicId: number){
		const existingTopic = await this.prisma.topic.findUnique({ where: { id: topicId } });

		if (!existingTopic) {
      throw new BadRequestException('Tópico não encontrado');
		}

		return await this.prisma.topic.delete({
			where: {
				id:topicId
			}
		})
	}

  async updateUserProgress(userId: number, topicId: number, checked: boolean): Promise<UserProgress> {
		const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
		const existingTopic = await this.prisma.topic.findUnique({ where: { id: topicId } });

		if (!existingTopic) {
      throw new BadRequestException('Tópico não encontrado');
		}

		if (!existingUser) {
      throw new BadRequestException('Usuário não encontrado');
		}

		return this.prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: { checked },
      create: {
        userId,
        topicId,
        checked,
      },
    });
  }
}
