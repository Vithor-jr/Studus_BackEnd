import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ActivityUpdateDto } from '../dto/activity-update.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}
	
	//~~~~~~~~~~~~~~~~~~~~~CRUD~~~~~~~~~~~~~~~~~~~~~~
	async createActivity(userId: number, activityData: any) {
    try {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            throw new Error('User não encontrado');
        }

        const category = await this.prisma.category.findUnique({ where: { id: activityData.categoryId } });

        if (!category || (category.userId !== userId && !category.isDefault)) {
            throw new Error('Categoria não encontrada ou não pertence ao usuário');
        }

        const dueDate = new Date(activityData.dueDate);
        dueDate.setHours(23, 59, 59, 999);//Fuso horário de Manaus -> GMT-4
        const formattedDueDate = dueDate.toISOString(); // Converte para o formato ISO 8601

        // Criar a atividade com a data de vencimento ajustada
        return await this.prisma.activity.create({
            data: {
                ...activityData,
                dueDate: formattedDueDate,
                userId: userId,
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
	}

	async updateActivity(activityId: number, data: any) {
    return this.prisma.activity.update({
      where: { id : activityId},
      data,
    });
  }

	async deleteActivity(userId: number, activityId: number) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id: userId } });

			if (!user) {
				throw new Error('User não encontrado');
			}

			const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });

			if (!activity || activity.userId !== userId) {
				throw new Error('Atividade não encontrada ou não pertence ao usuário');
			}

			return await this.prisma.activity.delete({
				where: {
					id: activityId,
				},
			});
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async completeActivity(userId: number, activityId: number) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id: userId } });
	
			if (!user) {
				throw new Error('User não encontrado');
			}
			
			const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
	
			if (!activity || activity.userId !== userId) {
				throw new Error('Atividade não encontrada ou não pertence ao usuário');
			}
	
			return await this.prisma.activity.update({
				where: {
					id: activityId,
				},
				data: {
				 completed: true,
				 completedAt: new Date().toISOString(),
				},
			});
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async putImportantActivity(userId: number, activityId: number) {
		try {
			const user = await this.prisma.user.findUnique({ where: { id: userId } });
	
			if (!user) {
				throw new Error('User não encontrado');
			}
			
			const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
	
			if (!activity || activity.userId !== userId) {
				throw new Error('Atividade não encontrada ou não pertence ao usuário');
			}
	
			return await this.prisma.activity.update({
				where: {
					id: activityId,
				},
				data: {
				 important:true
				},
			});
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	async getActivitiesByUser(userId: number) {
		return this.prisma.activity.findMany({
			where: {
				userId: userId,
			},
			include: {
				category: true,
			}
		});
	}

	async getActivitiesById(activityId: number) {
		return this.prisma.activity.findMany({
			where: {
				id : activityId
			},
			include: {
				category: true,
			}
		});
	}

	//~~~~~~~~~~~~~~ATIVIDADES ATRIBUÍDAS~~~~~~~~~~~~~~~~~~~~

	async getAtivitysToday(userId: number): Promise<any[]> {
    	// Cria um objeto Date com a data atual no fuso horário GMT-4 (como o de Manaus)
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
		tomorrow.setHours(0, 0,0 ,0)
		today.setHours(0, 0,0 ,0)

    return this.prisma.activity.findMany({
      where: {
        userId: userId,
				completed:false,
        dueDate: {
          gte: today.toISOString(),
          lt: tomorrow.toISOString(),
        },
      },
      include: {
        category: true,
      },
    });
  }

	async getActivitiesWeek(userId: number): Promise<any[]> {

		// Cria um objeto Date com a data atual no fuso horário GMT-4 (como o de Manaus)
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));
		today.setHours(0, 0, 0, 0);
		// Obtém o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
		const dayWeek = today.getDay();


		// Calcula a diferença entre o dia atual e o próximo Domingo
		const difMonday = dayWeek

		// Define o início da semana (Domingo às 00:00:00)
		const startOfWeek = new Date(today);
		startOfWeek.setDate(today.getDate() - difMonday);
		startOfWeek.setHours(0, 0, 0, 0);

		// Define o fim da semana (próximo Domingo às 00:00:00)
		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.prisma.activity.findMany({
      where: {
        userId: userId,
				completed:false,
        dueDate: {
          gte: today.toISOString(),
          lt: endOfWeek.toISOString(),
        },
      },
      include: {
        category: true,
      },
			orderBy: {
				dueDate: 'asc',
			},
    });
	
  }

	async getActivitiesNextWeek(userId: number): Promise<any[]> {
		// Cria um objeto Date com a data atual no fuso horário GMT-4 (como o de Manaus)
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));

		// Obtém o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
		const dayWeek = today.getDay();

		// Define o início da próxima semana (próximo Domingo às 00:00:00)
		const startOfNextWeek = new Date(today);
		startOfNextWeek.setDate(today.getDate() - dayWeek + 7);
		startOfNextWeek.setHours(0, 0, 0, 0);
		// Define o fim da próxima semana (Domingo da semana seguinte às 00:00:00)
		const endOfNextWeek = new Date(startOfNextWeek);
		endOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

		return this.prisma.activity.findMany({
			where: {
				userId: userId,
				completed:false,
				dueDate: {
					gte: startOfNextWeek.toISOString(),
					lt: endOfNextWeek.toISOString(),
				},
			},
			include: {
				category: true,
			},
			orderBy: {
				dueDate: 'asc',
			},
		});
	}
	
	async getActivitiesNotNextWeek(userId: number): Promise<any[]> {

		// Cria um objeto Date com a data atual no fuso horário GMT-4 (como o de Manaus)
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));

		// Obtém o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
		const dayWeek = today.getDay();


		// Define o início do período após a próxima semana (Domingo da semana seguinte às 00:00:00)
		const startOfAfterNextWWeek = new Date(today);
		startOfAfterNextWWeek.setDate(today.getDate() - dayWeek + 14);
		startOfAfterNextWWeek.setHours(0, 0, 0, 0);


		return this.prisma.activity.findMany({
			where: {
				userId: userId,
				completed:false,
				dueDate: {
					gte: startOfAfterNextWWeek.toISOString(), // atividades depois do início da próxima semana
				},
			},
			include: {
				category: true,
			},
			orderBy: {
				dueDate: 'asc',
			},
		});
	}

	async getActivitiesAtribuidas(userId: number): Promise<any[]> {
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));
		today.setHours(0, 0, 0, 0)

		return this.prisma.activity.findMany({
			where: {
				userId: userId,
				completed:false,
				dueDate: {
					gte: today.toISOString(),
				},
			},
			include: {
				category: true,
			},
			orderBy: {
				dueDate: 'asc',
			},
		});
	}


	//~~~~~~~~~~~~~ATIVIDADES NÃO COMPLETADAS~~~~~~~~~~~~~~~~~~~~~~

	async getAtivitysNotCompletedToday(userId: number): Promise<any[]> {
    	// Cria um objeto Date com a data atual no fuso horário GMT-4 (como o de Manaus)
			const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));
			const tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + 1);
			tomorrow.setHours(0, 0,0 ,0)
			today.setHours(0, 0,0 ,0)	

    return this.prisma.activity.findMany({
      where: {
        userId: userId,
				completed:false,
        dueDate: {
          gte: today.toISOString(),
          lt: tomorrow.toISOString(),
        },
      },
      include: {
        category: true,
      },
			orderBy: {
				dueDate: 'asc',
			},
    });
  }

	async getActivitiesNotCompletedThisWeek(userId: number): Promise<any[]> {
		// Cria um objeto Date com a data atual no fuso horário GMT-4 (como o de Manaus)
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));

		// Obtém o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
		const dayWeek = today.getDay();

		// Define o início da semana (Domingo às 00:00:00)
		const startOfWeek = new Date(today);
		startOfWeek.setDate(today.getDate() - dayWeek);
		startOfWeek.setHours(0, 0, 0, 0);

		// Define o fim do intervalo (hoje às 00:00:00)
		const fimDoIntervalo = new Date(today);
		fimDoIntervalo.setHours(0, 0, 0, 0);

    return this.prisma.activity.findMany({
        where: {
            userId: userId,
            completed: false,
            dueDate: {
							gte: startOfWeek.toISOString(), // atividades depois do início desta semana
							lt: today.toISOString() // atividades estritamente antes do dia atual
					}
        },
        include: {
            category: true,
        },
				orderBy: {
					dueDate: 'asc',
				},
    });
	}

	async getActivitiesNotCompletedLastWeek(userId: number): Promise<any[]> {
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));

		const dayWeek = today.getDay();

		const startOfLastWeek = new Date(today);
		startOfLastWeek.setDate(today.getDate() - dayWeek - 7);
		startOfLastWeek.setHours(0, 0, 0, 0);

		// Define o fim da próxima semana (Domingo da semana seguinte às 00:00:00)
		const endOfLastWeek = new Date(today);
		endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
		endOfLastWeek.setHours(0, 0, 0, 0)

		return this.prisma.activity.findMany({
			where: {
				userId: userId,
				completed:false,
				dueDate: {
					gte: startOfLastWeek.toISOString(),
					lt: endOfLastWeek.toISOString(),
				},
			},
			include: {
				category: true,
			},
			orderBy: {
				dueDate: 'asc',
			},
		});
	}

	async getActivitiesNotBeforeLastWeek(userId: number): Promise<any[]> {
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));

		const dayWeek = today.getDay();


		const startOfLastWeek = new Date(today);
		startOfLastWeek.setDate(today.getDate() - dayWeek - 7);
		startOfLastWeek.setHours(0, 0, 0, 0);

		return this.prisma.activity.findMany({
				where: {
						userId: userId,
						completed: false,
						dueDate: {
								lte: startOfLastWeek.toISOString(),
						},
				},
				include: {
						category: true,
				},
				orderBy: {
					dueDate: 'asc',
				},
		});
	}

	//~~~~~~~~~~~~~~~~~~~ATIVIDADES COMPLETADAS~~~~~~~~~~~~~~~~~~~~~~

	async getCompletedActivitiesToday(userId: number): Promise<any[]> {
		 const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));
		 const tomorrow = new Date(today);
		 tomorrow.setDate(today.getDate() + 1);
		 tomorrow.setHours(0, 0,0 ,0)
		 today.setHours(0, 0,0 ,0) 

    const activities = await this.prisma.activity.findMany({
      where: {
        userId: userId,
        completed: true,
        dueDate: {
          gte: today.toISOString(),
          lt: tomorrow.toISOString(),
        },
      },
			include: {
        category: true,
      },
			orderBy: {
				dueDate: 'asc',
			},
    });

    return activities;
  }

	async getActivitiesCompletedThisWeek(userId: number): Promise<any[]> {
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));

		const dayWeek = today.getDay();

		const startOfWeek = new Date(today);
		startOfWeek.setDate(today.getDate() - dayWeek);
		startOfWeek.setHours(0, 0, 0, 0);

		// Define o fim do intervalo (hoje às 00:00:00)
		const fimDoIntervalo = new Date(today);
		fimDoIntervalo.setHours(0, 0, 0, 0);

    return this.prisma.activity.findMany({
        where: {
            userId: userId,
            completed: true,
            dueDate: {
							gte: startOfWeek.toISOString(), // atividades depois do início desta semana
							lt: today.toISOString() // atividades estritamente antes do dia atual
					}
        },
        include: {
            category: true,
        },
				orderBy: {
					dueDate: 'asc',
				},
    });
	}

	async getActivitiesCompletedLastWeek(userId: number): Promise<any[]> {
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));

		// Obtém o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
		const dayWeek = today.getDay();
 
		// Define o início da semana passada (próximo Domingo às 00:00:00)
		const startOfLastWeek = new Date(today);
		startOfLastWeek.setDate(today.getDate() - dayWeek - 7);
		startOfLastWeek.setHours(0, 0, 0, 0);

		// Define o fim da semana passada (Domingo da semana seguinte às 00:00:00)
		const endOfLastWeek = new Date(today);
		endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
		endOfLastWeek.setHours(0, 0, 0, 0)

		return this.prisma.activity.findMany({
			where: {
				userId: userId,
				completed:true,
				dueDate: {
					gte: startOfLastWeek.toISOString(),
					lt: endOfLastWeek.toISOString(),
				},
			},
			include: {
				category: true,
			},
			orderBy: {
				dueDate: 'asc',
			},
		});
	}

	async getActivitiesBeforeLastWeek(userId: number): Promise<any[]> {
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));

		const dayWeek = today.getDay();


		const startOfLastWeek = new Date(today);
		startOfLastWeek.setDate(today.getDate() - dayWeek - 7);
		startOfLastWeek.setHours(0, 0, 0, 0);

		return this.prisma.activity.findMany({
				where: {
						userId: userId,
						completed: true,
						dueDate: {
								lte: startOfLastWeek.toISOString(),
						},
				},
				include: {
						category: true,
				},
				orderBy: {
					dueDate: 'asc',
				},
		});
	}

	async getActivitiesCompletedEarly(userId: number): Promise<any[]> {
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));
    today.setHours(0, 0, 0, 0);

    return this.prisma.activity.findMany({
        where: {
            userId: userId,
            completed: true,
            dueDate: {
                gt: today.toISOString(),
            },
        },
        include: {
            category: true,
        },
				orderBy: {
					dueDate: 'asc',
				},
    });
	}

	//~~~~~~~~~~~~~~~~OUTROS~~~~~~~~~~~~


	async getCategoriesByUser(userId: number) {
		try {
			const userCategories = await this.prisma.category.findMany({ where: { userId } });
			const defaultCategories = await this.prisma.category.findMany({ where: { isDefault: true } });
			const allCategories = [...userCategories, ...defaultCategories];

			return allCategories;
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	
	async getActivitysImportants(userId: number):Promise<any[]> {
		const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Manaus"}));
		today.setHours(0, 0, 0, 0)

		return this.prisma.activity.findMany({
			where: {
				userId: userId,
				important:true,
				completed:false,
				dueDate: {
					gte: today.toISOString(),
				},
			},
			include: {
				category: true,
			}
		});
	}
}                                     