Este documento lista todos os cenários de testes necessários para garantir a integridade do Value Object `Email` utilizando a metodologia TDD.

## 1. Validações de Formato (Estrutura)

Garante que o endereço respeita a estrutura `parte-local@dominio.tld`.

- [x] Tentar criar um e-mail sem parte local (ex: `@domain.com`).
- [x] Tentar criar um e-mail sem o TLD (ex: `joe@doe`).
- [x] Tentar criar um e-mail com TLD de apenas 1 caractere (ex: `joe@doe.c`).
- [x] Tentar criar um e-mail sem `@` e sem domínio (ex: `plainaddress`).
- [x] Tentar criar um e-mail com mais de um `@` (ex: `joe@doe@test.com`).

## 2. Validações de Domínio

Garante que a parte do domínio é bem formada.

- [x] Tentar criar um e-mail cujo domínio começa com ponto (ex: `joedoe@.com`).
- [x] Tentar criar um e-mail com pontos consecutivos no domínio (ex: `joe@doe..com`).
- [x] Tentar criar um e-mail terminado em ponto (ex: `joe@.com.`).

## 3. Casos Limites e Sanitização (Edge Cases)

Trata entradas mal formatadas ou inesperadas. A entrada sofre `trim` + `toLowerCase` antes da validação.

- [x] Tentar criar um e-mail com espaço na parte local (ex: `joe doe@test.com`).
- [x] Tentar criar um e-mail vazio (string vazia).
- [x] Criar um e-mail válido e garantir que o valor é normalizado/retornado corretamente (ex: `joe@doe.com`).

---
