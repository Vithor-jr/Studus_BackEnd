# studUs | Back-end

<div align="center">
  <img src="docs/image.png" alt="studUs - Back-end" width="100%" />

  **API responsável pelo gerenciamento dos dados, usuários e funcionalidades do aplicativo studUs.**

  ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
</div>

---

## Sobre o projeto

O **studUs** é uma aplicação mobile desenvolvida para ajudar estudantes do Ensino Médio a organizar os estudos, gerenciar o tempo e cuidar do bem-estar emocional.

Este repositório contém o **back-end** da aplicação, responsável por fornecer os serviços e endpoints utilizados pelo aplicativo mobile.

A API foi desenvolvida com **NestJS** e **TypeScript**, utilizando **Prisma ORM** para realizar a comunicação com um banco de dados PostgreSQL.

O projeto disponibiliza funcionalidades para gerenciamento de usuários, atividades acadêmicas, sessões de estudo, acompanhamento emocional, editais e conversas.

O repositório do aplicativo mobile está disponível em [Vithor-jr/studUs](https://github.com/Vithor-jr/studUs).

## Funcionalidades

A API disponibiliza os seguintes recursos:

- **Autenticação:** login, validação de credenciais e gerenciamento de tokens JWT.
- **Usuários:** cadastro, consulta e atualização de informações pessoais.
- **Fotos de perfil:** upload e recuperação de imagens dos usuários.
- **Atividades:** criação, atualização, exclusão e acompanhamento de atividades acadêmicas.
- **Categorias:** gerenciamento de categorias e suas respectivas cores.
- **Sessões de estudo:** registro, atualização e acompanhamento da duração das sessões.
- **Bem-estar emocional:** registro diário de humor e consulta do histórico semanal.
- **Editais:** consulta de conteúdos e acompanhamento do progresso dos estudos.
- **Conversas:** criação de conversas e armazenamento de mensagens.
- **Recuperação de senha:** solicitação, validação de código e redefinição de senha.

## Arquitetura e tecnologias

O projeto utiliza uma arquitetura modular baseada no NestJS, separando responsabilidades entre controllers, services, módulos e objetos de transferência de dados (DTOs).

| Tecnologia | Utilização |
| --- | --- |
| [NestJS](https://nestjs.com/) | Framework para construção da API |
| [TypeScript](https://www.typescriptlang.org/) | Linguagem de programação |
| [Node.js](https://nodejs.org/) | Ambiente de execução |
| [Prisma ORM](https://www.prisma.io/) | Mapeamento objeto-relacional e acesso aos dados |
| [PostgreSQL](https://www.postgresql.org/) | Sistema gerenciador de banco de dados |
| [Passport](https://www.passportjs.org/) | Estratégias de autenticação |
| [JWT](https://jwt.io/) | Autenticação baseada em tokens |
| [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Hash de senhas |
| [Nodemailer](https://nodemailer.com/) | Envio de e-mails |
| [Axios](https://axios-http.com/) | Requisições HTTP |
| [Multer](https://github.com/expressjs/multer) | Recebimento de arquivos enviados pela API |
| [Imgur](https://imgur.com/) | Hospedagem de imagens de perfil |

## Banco de dados

O projeto utiliza PostgreSQL como sistema de gerenciamento de banco de dados, com o Prisma ORM para definição dos modelos, consultas e gerenciamento de migrações.

O arquivo `prisma/schema.prisma` contém a estrutura das entidades e seus relacionamentos.

### Principais entidades

| Entidade | Descrição |
| --- | --- |
| `User` | Armazena os dados dos usuários cadastrados |
| `Activity` | Registra as atividades acadêmicas |
| `Category` | Organiza as atividades e sessões por categorias |
| `StudySession` | Armazena as sessões de estudo e suas durações |
| `DailyMood` | Registra o estado emocional diário |
| `Topic` | Armazena os conteúdos relacionados aos editais |
| `UserProgress` | Registra o progresso individual nos conteúdos |
| `Conversation` | Armazena as conversas dos usuários |
| `Message` | Registra as mensagens de cada conversa |
| `PasswordReset` | Armazena solicitações de recuperação de senha |

### Relacionamentos

- Um usuário pode possuir várias atividades, categorias e sessões de estudo.
- Um usuário pode registrar vários estados emocionais ao longo do tempo.
- Um usuário pode acompanhar seu progresso em diferentes conteúdos.
- Uma conversa pode possuir várias mensagens.
- Uma categoria pode agrupar diversas atividades e sessões de estudo.

## Endpoints

A API disponibiliza endpoints organizados por módulos.

| Módulo | Método | Endpoint | Descrição |
| --- | --- | --- | --- |
| Autenticação | POST | `/login` | Realiza login |
| Autenticação | POST | `/request-password-reset` | Solicita recuperação de senha |
| Autenticação | POST | `/verify-reset-code` | Valida o código de recuperação |
| Autenticação | POST | `/reset-password` | Redefine a senha |
| Usuários | POST | `/user` | Cadastra um usuário |
| Usuários | GET | `/user/dados` | Consulta dados do usuário autenticado |
| Usuários | PUT | `/user/:id/update-user` | Atualiza dados do usuário |
| Usuários | POST | `/user/upload-photo` | Envia foto de perfil |
| Atividades | POST | `/activities/create-activity` | Cria uma atividade |
| Atividades | GET | `/activities/:userId/today` | Consulta atividades do dia |
| Atividades | GET | `/activities/:userId/week` | Consulta atividades da semana |
| Atividades | PATCH | `/activities/:userId/complete` | Marca uma atividade como concluída |
| Atividades | DELETE | `/activities/:userId/delete-activity` | Exclui uma atividade |
| Categorias | POST | `/activities/create-category` | Cria uma categoria |
| Categorias | GET | `/activities/categories/:userId` | Consulta categorias do usuário |
| Sessões | POST | `/sessions/create-session` | Registra uma sessão de estudo |
| Sessões | GET | `/sessions/:userId/sessions-user` | Consulta sessões do usuário |
| Sessões | GET | `/sessions/sessions-week/:userId` | Consulta duração semanal |
| Humor | POST | `/mood/set-mood` | Registra o humor diário |
| Humor | GET | `/mood/:userId/mood-week` | Consulta histórico semanal |
| Editais | GET | `/edital` | Consulta conteúdos disponíveis |
| Editais | GET | `/edital/progress/:userId` | Consulta progresso do usuário |
| Conversas | POST | `/conversations` | Cria uma conversa |
| Conversas | GET | `/conversations/:userId` | Consulta conversas do usuário |
| Mensagens | POST | `/messages` | Registra uma mensagem |
| Mensagens | GET | `/messages/:conversationId` | Consulta mensagens de uma conversa |

**Observação:** os endpoints apresentados são uma seleção dos principais recursos. Existem outras operações para atualização, exclusão, consulta de atividades por período, acompanhamento de tarefas e gerenciamento de sessões.

A API utiliza um guard global de autenticação JWT. Os endpoints explicitamente marcados como públicos no código podem ser acessados sem autenticação. Consulte os controllers para verificar a proteção de cada rota.

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS).
- npm.
- [PostgreSQL](https://www.postgresql.org/).
- Git.

### 1. Clone o repositório

```bash
git clone https://github.com/Vithor-jr/Studus_BackEnd.git
cd Studus_BackEnd
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

O Prisma utiliza as seguintes variáveis para conexão com o PostgreSQL:

```env
POSTGRES_PRISMA_URL="URL_DE_CONEXAO_COM_POOLING"
POSTGRES_URL_NON_POOLING="URL_DE_CONEXAO_DIRETA"
JWT_SECRET="SUA_CHAVE_SECRETA"
```

Configure os valores de acordo com seu ambiente e com as credenciais do banco de dados.

**Importante:** não compartilhe o arquivo `.env` nem envie suas credenciais para o GitHub.

### 4. Gere o Prisma Client

```bash
npx prisma generate
```

### 5. Execute as migrações

Para aplicar as migrações existentes em um banco de dados:

```bash
npx prisma migrate deploy
```

Durante o desenvolvimento, para criar e aplicar novas migrações:

```bash
npx prisma migrate dev
```

### 6. Inicie a aplicação

Modo de desenvolvimento:

```bash
npm run start:dev
```

Modo de produção:

```bash
npm run build
npm run start:prod
```

Após a inicialização, a API estará disponível em:

```text
http://localhost:8000
```

## Prisma Studio

O projeto utiliza o Prisma Studio para facilitar a visualização e o gerenciamento dos registros do banco de dados.

Para iniciar a interface:

```bash
npx prisma studio
```

Por padrão, o Prisma Studio estará disponível em:

```text
http://localhost:5555
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run start` | Inicia a aplicação |
| `npm run start:dev` | Inicia em modo de desenvolvimento |
| `npm run start:debug` | Inicia em modo de depuração |
| `npm run start:prod` | Inicia em modo de produção |
| `npm run build` | Compila a aplicação |
| `npm run format` | Formata os arquivos TypeScript |
| `npm run lint` | Executa o ESLint |
| `npm run test` | Executa os testes unitários |
| `npm run test:watch` | Executa os testes em modo de observação |
| `npm run test:cov` | Gera relatório de cobertura |
| `npm run test:e2e` | Executa testes de ponta a ponta |

## Estrutura do projeto

```text
Studus_BackEnd/
├── docs/
│   └── image.png
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── activity/
│   │   ├── activity/
│   │   ├── categories/
│   │   └── dto/
│   ├── auth/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── errors/
│   │   ├── guards/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── strategies/
│   ├── Conversations/
│   ├── Edital/
│   │   └── dto/
│   ├── Mood/
│   │   ├── dto/
│   │   └── mood/
│   ├── password-reset/
│   ├── prisma/
│   ├── Sessions/
│   ├── user/
│   │   ├── dto/
│   │   └── entities/
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env
├── package.json
├── package-lock.json
├── tsconfig.json
├── nest-cli.json
└── vercel.json
```

## Integração com o aplicativo mobile

O back-end fornece os serviços consumidos pelo aplicativo mobile desenvolvido com React Native e Expo.

A comunicação ocorre por meio de requisições HTTP, permitindo que o aplicativo envie e consulte informações dos usuários.

**Front-end:** [Vithor-jr/studUs](https://github.com/Vithor-jr/studUs).

## Equipe

| Nome | Papel |
| --- | --- |
| **Vithor Vitório** | Desenvolvedor (front-end e back-end) |
| **Cecília Costa** | Design / Projetista (UX/UI) |
| **Silvana Benchimol** | Analista de Sistemas |

O estudo de caso de UX/UI está disponível no portfólio de Cecília: [studUs](https://cecilia-three.vercel.app/ux-ui-design/studus).

## Autor

**Vithor Vitório**

[Portfólio](https://vithor.vercel.app) · [LinkedIn](https://www.linkedin.com/in/vithor-vit%C3%B3rio-63887b2a6) · [GitHub](https://github.com/Vithor-jr)
