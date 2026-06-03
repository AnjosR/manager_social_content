# Casos de Teste — SignUpUseCase

> Projeto: Sistema ONG CERAC  
> Módulo: Acesso / Administradores  
> Caso de uso: `SignUpUseCase`  
> Estratégia: TDD + SOLID + Clean Architecture  
> Framework sugerido: Vitest

---

## 1. Objetivo do caso de uso

O `SignUpUseCase` deve permitir o cadastro de um novo administrador no CMS da ONG CERAC.

Esse caso de uso é responsável por:

- Validar os dados de entrada.
- Impedir cadastro com e-mail já existente.
- Garantir que a senha não seja salva em texto plano.
- Gerar um identificador único para o usuário.
- Persistir o administrador no repositório.
- Retornar os dados seguros do usuário criado.

---

## 2. Regras de negócio envolvidas

| Código | Regra        | Descrição                                                           |
| :----- | :----------- | :------------------------------------------------------------------ |
| RN07   | E-mail único | Não deve permitir dois administradores com o mesmo e-mail.          |
| RN08   | Senha segura | A senha deve ter tamanho mínimo e ser armazenada como hash.         |
| RN09   | Nome válido  | O nome do administrador deve possuir pelo menos 3 caracteres úteis. |

---

## 3. Contrato sugerido do caso de uso

### Input

```ts
interface SignUpInput {
  name: string
  email: string
  password: string
}
```

### Output

```ts
interface SignUpOutput {
  user: {
    id: string
    name: string
    email: string
    createdAt: Date
    updatedAt: Date
  }
}
```

> Observação: o retorno não deve expor `password` nem `passwordHash`.

---

## 4. Dependências esperadas

Para manter baixo acoplamento e facilitar testes unitários, o caso de uso deve depender de abstrações.

```ts
interface UserRepository {
  save(user: User): Promise<void>
  findByEmail(email: string): Promise<User | null>
}

interface HashGenerator {
  hash(value: string): Promise<string>
}

interface IdGenerator {
  generate(): string
}
```

---

## 5. Massa base para os testes

```ts
const validInput = {
  name: 'Admin User',
  email: 'admin@cerac.org',
  password: '123456',
}
```

---

# 6. Casos de teste

## Fluxo Principal (Sucesso)

- [x] Deve garantir que o `UserRepository.findByEmail` é chamado com o e-mail normalizado correto.
- [x] Deve garantir que o `HashGenerator.hash` é chamado com a senha em texto plano informada.
- [x] Deve garantir que o `IdGenerator.generate` é chamado para gerar o ID do novo administrador.
- [x] Deve garantir que o `UserRepository.save` é chamado com os dados corretos do usuário.
- [ ] Deve garantir que o administrador é cadastrado com nome normalizado.
- [ ] Deve garantir que o administrador é cadastrado com e-mail normalizado.
- [x] Deve garantir que o administrador é salvo com `passwordHash`, e não com `password`.
- [ ] Deve garantir que o administrador é criado com `createdAt`.
- [ ] Deve garantir que o sistema retorna os dados públicos do administrador cadastrado.
- [ ] Deve garantir que o sistema não retorna `password` nem `passwordHash` na resposta.

## Fluxos de Exceção (Regras de Negócio)

- [ ] Deve garantir que o sistema retorna um erro de "Nome Inválido" se o nome estiver vazio.
- [ ] Deve garantir que o sistema retorna um erro de "Nome Inválido" se o nome possuir menos de 3 caracteres úteis.
- [ ] Deve garantir que o sistema retorna um erro de "E-mail Inválido" se o e-mail estiver vazio.
- [ ] Deve garantir que o sistema retorna um erro de "E-mail Inválido" se o e-mail possuir formato inválido.
- [ ] Deve garantir que o sistema retorna um erro de "E-mail Já Cadastrado" se já existir um administrador com o mesmo e-mail.
- [ ] Deve garantir que o sistema retorna um erro de "Senha Inválida" se a senha estiver vazia.
- [ ] Deve garantir que o sistema retorna um erro de "Senha Inválida" se a senha possuir menos de 6 caracteres.
- [ ] Deve garantir que o `HashGenerator.hash` não é chamado quando os dados de entrada forem inválidos.
- [ ] Deve garantir que o `IdGenerator.generate` não é chamado quando os dados de entrada forem inválidos.
- [ ] Deve garantir que o `UserRepository.save` não é chamado quando os dados de entrada forem inválidos.
- [ ] Deve garantir que o `UserRepository.save` não é chamado quando o e-mail já estiver cadastrado.

## Tratamento de Erros (Infraestrutura)

- [ ] Deve garantir que o caso de uso repassa a exceção se o `UserRepository.findByEmail` falhar.
- [ ] Deve garantir que o caso de uso repassa a exceção se o `HashGenerator.hash` falhar.
- [ ] Deve garantir que o caso de uso repassa a exceção se o `IdGenerator.generate` falhar.
- [ ] Deve garantir que o caso de uso repassa a exceção se o `UserRepository.save` falhar.

---

# 7. Ordem sugerida para implementação via TDD

Uma boa ordem para implementar os testes é começar pelo fluxo mais simples e depois adicionar as regras de negócio.

1. CT01 — Deve cadastrar um administrador com dados válidos.
2. CT02 — Não deve cadastrar com e-mail já existente.
3. CT03 — Não deve cadastrar com nome vazio.
4. CT04 — Não deve cadastrar com nome menor que 3 caracteres.
5. CT05 — Deve normalizar espaços extras no nome.
6. CT06 — Não deve cadastrar com e-mail vazio.
7. CT07 — Não deve cadastrar com formato de e-mail inválido.
8. CT08 — Deve normalizar o e-mail.
9. CT09 — Não deve cadastrar com senha vazia.

---

# 8. Observações de design

## 8.1. O que deve ficar no domínio

Pode ficar no domínio:

- Validação de nome.
- Validação de e-mail.
- Criação da entidade `User`.
- Garantia de que `passwordHash` existe.
- Datas de criação e atualização.

Exemplo:

```ts
User.create({
  id,
  name,
  email,
  passwordHash,
})
```

## 8.2. O que deve ficar no caso de uso

Deve ficar no caso de uso:

- Verificar se o e-mail já existe.
- Chamar o serviço de hash.
- Chamar o gerador de ID.
- Chamar o repositório para salvar.
- Orquestrar o fluxo de cadastro.

## 8.3. O que não deve ficar no caso de uso

Evite colocar diretamente no caso de uso:

- Implementação concreta de bcrypt.
- Implementação concreta de banco de dados.
- Implementação concreta de geração de UUID.
- Regras HTTP, como status code, request e response.

Essas responsabilidades pertencem aos adaptadores e à infraestrutura.

---

# 9. Checklist final do SignUpUseCase

- [ ] Valida nome obrigatório.
- [ ] Valida nome com mínimo de 3 caracteres úteis.
- [ ] Normaliza nome.
- [ ] Valida e-mail obrigatório.
- [ ] Valida formato do e-mail.
- [ ] Normaliza e-mail.
- [ ] Verifica duplicidade por e-mail.
- [ ] Valida senha obrigatória.
- [ ] Valida senha com mínimo de 6 caracteres.
- [ ] Gera hash da senha.
- [ ] Nunca salva senha em texto plano.
- [ ] Gera ID do usuário.
- [ ] Cria `createdAt`.
- [ ] Cria `updatedAt`.
- [ ] Salva o usuário.
- [ ] Não retorna `passwordHash`.
- [ ] Propaga erros inesperados.
