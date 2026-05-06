<div align="center">

# Manager Social Content

![Node](https://img.shields.io/badge/Node.js-24%2B-339933?logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white) ![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6E9F18?logo=vitest&logoColor=white) ![Yarn](https://img.shields.io/badge/Yarn-4-2C8EBB?logo=yarn&logoColor=white) ![License](https://img.shields.io/badge/license-MIT-blue)

**Sistema ONG CERAC** — uma plataforma de gestão de conteúdo
que dá visibilidade às ações sociais realizadas pela ONG.

---

## Sobre o projeto

</div>

A ONG CERAC (Centro Regional de Assessoria e Capacitação) precisa de um
canal próprio para divulgar suas ações de forma organizada, acessível e
sustentável. O sistema é dividido em duas frentes:

- **Vitrine Pública:** site aberto onde qualquer visitante pode
  conhecer a ONG e acompanhar as ações realizadas.
- **CMS (este repositório):** painel restrito onde os colaboradores da
  instituição cadastram, editam e removem conteúdos que alimentam a
  vitrine.

## Motivação

Mais do que entregar uma aplicação que funciona, o projeto tem como
objetivo construir uma base **manutenível, testável e escalável** —
preparada para evoluir junto com as necessidades da ONG ao longo dos
anos, sem dívida técnica acumulada.

Por isso, o desenvolvimento é guiado por três pilares:

- **TDD (Test Driven Development):** O código nasce dos testes. Cada
  comportamento é descrito como teste antes de ser implementado, o que
  produz uma rede de segurança natural e força um design desacoplado.
- **Clean Architecture:** As regras de negócio ficam isoladas de
  detalhes de framework, banco de dados e protocolos de transporte.
  Trocar uma tecnologia (ex.: PostgreSQL por outro banco) não deve
  exigir reescrever a lógica do sistema.
- **Princípios SOLID:** Orientam decisões cotidianas de design para
  manter o código coeso, com baixo acoplamento e aberto a extensão.

## Stack

- **Linguagem:** TypeScript (modo estrito)
- **Runtime:** Node.js 24+
- **Gerenciador:** Yarn 4 (via Corepack)
- **Módulos:** ESM nativo com `NodeNext`
- **Testes:** Vitest + `vitest-mock-extended`
- **Qualidade:** ESLint Flat Config + Prettier + Husky + lint-staged
- **Banco de dados:** PostgreSQL _(em planejamento)_
- **Infraestrutura:** Docker _(em planejamento)_

## Estrutura

O atual código é organizado em camadas que refletem a Clean Architecture:

- **`src/domain`** — entidades e regras de negócio puras.
- **`src/application`** — casos de uso e contratos (ports) que o
  domínio expõe ao mundo externo.
- **`src/infra`** — adaptadores concretos (banco, criptografia, HTTP)
  que implementam os contratos da aplicação.
- **`test/`** — espelha a estrutura de `src/` com os testes
  automatizados.
- **`doc/`** — PRD, planos de teste e notas técnicas.

## Pré-requisitos

- Node.js **24.15+**
- Corepack habilitado
- Yarn **4+**

## Como rodar

```bash
git clone https://github.com/oAnjophb/manager_social_content.git
cd manager_social_content
corepack enable
yarn install
yarn dev
```

Para rodar a suíte de testes:

```bash
yarn test
ou
yarn test:watch
```

## Status

O projeto está em desenvolvimento ativo. Funcionalidades implementadas
e próximos passos são acompanhados nas notas em `doc/`.
