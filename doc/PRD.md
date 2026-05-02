# Product Requirements Document (PRD) - Sistema ONG CERAC

## 1. Visão Geral do Projeto

O projeto consiste em uma aplicação web dividida em duas frentes: uma **Vitrine Pública** (Front-End) para dar visibilidade às ações da ONG CERAC (Centro Regional de Assessoria e Capacitação) e um **CMS** (Back-End) restrito para que os colaboradores da instituição gerenciem o conteúdo exibido.

## 2. Atores do Sistema

- **Visitante (Público):** Usuário não autenticado que acessa a vitrine para conhecer a ONG, ler sobre as ações e encontrar formas de contato.
- **Colaborador (Admin):** Usuário autenticado que acessa o painel administrativo para cadastrar, editar ou remover conteúdos que alimentarão a vitrine.

## 3. Arquitetura e Stack Tecnológica

O sistema deve ser construído visando manutenibilidade, testabilidade e escalabilidade a longo prazo.

- **Front-End:** React.
- **Back-End:** TypeScript.
- **Banco de Dados:** PostgreSQL.
- **Ambiente e Infraestrutura:** Docker para isolamento e padronização do ambiente de desenvolvimento.
- **Padrões Arquiteturais:** Clean Architecture (separação em Domínio, Casos de Uso, Adaptadores e Infraestrutura) e aplicação estrita dos princípios SOLID e injeção de dependências para garantir baixo acoplamento e alta coesão.
- **Qualidade e Testes:** Desenvolvimento guiado por testes (TDD) utilizando o framework Vitest.

---

## 4. Especificações do Front-End (Vitrine Pública)

### 4.1. Requisitos Funcionais

- **Página Inicial (Feed de Ações):** Deve exibir um feed em ordem cronológica reversa contendo as ações registradas pelo CMS.
- **Detalhes da Ação:** Ao clicar em uma ação, o visitante deve ver a página detalhada contendo o título, data, participantes, descrição completa e a galeria de imagens.
- **Páginas Institucionais:** O sistema deve possuir seções estáticas para "Sobre a ONG" e "Contato".
- **Paginação/Carregamento:** O feed de ações deve implementar paginação ou _infinite scroll_ para otimizar o carregamento e consumo de dados.

### 4.2. Requisitos Não Funcionais

- **Responsividade:** A interface deve ser _mobile-first_, adaptando-se perfeitamente a smartphones, tablets e desktops.
- **SEO:** O front-end deve estar otimizado para motores de busca (uso correto de tags semânticas e meta descriptions).

---

## 5. Especificações do Back-End (CMS)

### 5.1. Requisitos Funcionais - Módulo de Conteúdo (Ações)

O sistema deve expor uma API para suportar as seguintes operações de gerenciamento de conteúdo:

- **Criar Conteúdo (`RegisterContentUseCase`):** Permite cadastrar uma nova ação com título, descrição detalhada, data, participantes e imagens.
- **Listar Conteúdos:** Retorna a lista de ações paginadas para consumo do front-end.
- **Buscar Conteúdo por ID:** Retorna os detalhes de uma ação específica.
- **Atualizar Conteúdo:** Permite modificar os dados de uma ação existente.
- **Deletar/Arquivar Conteúdo:** Permite remover uma ação da vitrine pública.

### 5.2. Requisitos Funcionais - Módulo de Acesso (Administradores)

- **Cadastro de Administrador:** Permite registrar novos usuários com permissão de acesso ao CMS.
- **Autenticação:** Sistema de login seguro para gerar os tokens de acesso às rotas protegidas.

---

## 6. Regras de Negócio e Validações de Domínio

As seguintes regras devem ser rigorosamente validadas na camada de domínio/aplicação, antes de qualquer interação com o banco de dados:

### 6.1. Regras para Registro de Conteúdo (Ações da ONG)

- **RN01 - Título Obrigatório:** O título da ação não pode estar vazio e deve conter no mínimo 5 caracteres úteis.
- **RN02 - Descrição Obrigatória:** A descrição detalhada não pode estar vazia ou conter apenas espaços.
- **RN03 - Data da Ação:** A data deve ser um formato válido e não pode ser uma data futura (deve ser igual ou anterior à data atual).
- **RN04 - Mídia Obrigatória:** É obrigatório o envio de pelo menos 1 (uma) imagem para compor a vitrine visual.
- **RN05 - Limite de Mídia:** Uma ação pode conter no máximo 10 imagens associadas.
- **RN06 - Status:** Todo conteúdo recém-criado deve assumir um status inicial pré-definido (ex: `published` ou `draft`).

### 6.2. Regras para Registro de Usuários (Administradores)

- **RN07 - E-mail Único:** O sistema não deve permitir o cadastro de dois administradores com o mesmo endereço de e-mail.
- **RN08 - Senha Segura:** As senhas devem possuir um tamanho mínimo (ex: 6 caracteres) e nunca devem ser trafegadas ou armazenadas em texto plano (obrigatório o uso de funções de hash).
- **RN09 - Nome Válido:** O nome do administrador deve possuir pelo menos 3 caracteres.

---

## 7. Modelagem de Dados Inicial (Entidades Principais)

### 7.1. Entidade: `User` (Administrador)

- `id`: UUID ou CUID (Chave Primária)
- `name`: String
- `email`: String (Único)
- `passwordHash`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 7.2. Entidade: `Content` (Ação da ONG)

- `id`: UUID ou CUID (Chave Primária)
- `title`: String
- `detailedDescription`: Text
- `actionDate`: DateTime
- `participants`: Array de Strings (Opcional)
- `images`: Array de Strings (URLs geradas pelo storage)
- `status`: String (Ex: 'published')
- `createdAt`: DateTime
- `updatedAt`: DateTime

---

## 8. Contratos Esperados (Interfaces de Repositório)

A camada de infraestrutura deverá implementar contratos abstratos para interagir com o PostgreSQL. Exemplo de abstração esperada:

```typescript
interface ContentRepository {
  save(content: Content): Promise<void>
  findById(id: string): Promise<Content | null>
  findAll(page: number, limit: number): Promise<Content[]>
  delete(id: string): Promise<void>
}

interface UserRepository {
  save(user: User): Promise<void>
  findByEmail(email: string): Promise<User | null>
}
```
