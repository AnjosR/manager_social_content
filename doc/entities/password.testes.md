****# Documentação de Casos de Teste: Value Object - Password

Este documento lista todos os cenários de testes necessários para garantir a segurança e integridade do Value Object `Password` utilizando a metodologia TDD.

## 1. Validações de Tamanho (Length)

O tamanho da senha é a primeira e mais importante camada de segurança.

- [x] Tentar criar uma senha com 0 caracteres (string vazia).
- [x] Tentar criar uma senha com tamanho menor que o mínimo exigido (ex: 7 caracteres).
- [x] Tentar criar uma senha com tamanho maior que o limite máximo (ex: 73 caracteres).
- [x] Criar uma senha exatamente com o tamanho mínimo (ex: 8 caracteres).
- [x] Criar uma senha exatamente com o tamanho máximo (ex: 72 caracteres).

## 2. Validações de Complexidade (Strength)

Garante que a senha contém a entropia necessária contra ataques de força bruta.

- [x] Tentar criar uma senha sem nenhuma letra maiúscula (ex: `senha123!`).
- [x] Tentar criar uma senha sem nenhuma letra minúscula (ex: `SENHA123!`).
- [x] Tentar criar uma senha sem nenhum número (ex: `SenhaForte!`).
- [x] Tentar criar uma senha sem nenhum caractere especial (ex: `SenhaForte123`).

## 3. Casos Limites e Sanitização (Edge Cases)

Trata entradas mal formatadas ou inesperadas.

- [x] Tentar criar uma senha contendo apenas espaços em branco (ex: `        `).
- [x] Tentar criar uma senha com espaços no início ou no fim. O sistema deve aplicar o trim e, em seguida, validar o tamanho real. Se após o trim a senha ficar menor que 8 caracteres, deve falhar.
- [x] Aceitar senhas que contenham espaços válidos no meio da string (ex: `Minha Senha 123!`).

---
