Este documento lista todos os cenários de testes necessários para garantir a integridade do Value Object `Name` utilizando a metodologia TDD.

## 1. Validações de Tamanho (Length)

O nome deve possuir um mínimo de caracteres úteis (mínimo de 3).

- [x] Tentar criar um nome com 0 caracteres (string vazia).
- [x] Tentar criar um nome com tamanho menor que o mínimo exigido (ex: `ab`, 2 caracteres).

## 2. Casos Limites e Sanitização (Edge Cases)

Trata entradas mal formatadas ou inesperadas. A entrada sofre `trim` antes da validação.

- [x] Tentar criar um nome contendo apenas espaços em branco (ex: `  `). Após o `trim` fica vazio e deve falhar.

## 3. Caminho Feliz

- [x] Criar um nome válido e garantir que o valor é retornado corretamente (ex: `Joe Doe`).

---
