# Casos de Teste - RegisterContentUseCase

## 1. Setup e Preparação (SUT)

- SUT (System Under Test): `RegisterContentUseCase`.
- Dependências mockadas: `ContentRepository` (com o método `save`).

---

## 2. Caminhos de Exceção (Unhappy Paths)

Estes testes garantem que o sistema barra dados inválidos, protegendo a integridade da entidade `Content` antes de qualquer interação com o repositório.

### Validações de Título (Title)

- [x] Deve lançar um InvalidTitleError se o título for uma string vazia.
- [x] Deve lançar um erro se o título contiver apenas espaços em branco.
- [x] Deve lançar um erro se o título tiver menos de 5 caracteres.

### Validações de Descrição (DetailedDescription)

- [x] Deve lançar um erro (ex: `MissingParamError` ou `InvalidDescriptionError`) se a descrição não for fornecida.
- [x] Deve lançar um erro se a descrição for uma string vazia.
- [x] Deve lançar um erro se a descrição contiver apenas espaços em branco.

### Validações de Data (ActionDate)

- [x] Deve lançar um erro (ex: `MissingParamError` ou `InvalidDateError`) se a data da ação não for fornecida.
- [x] Deve lançar um erro se a data fornecida não for uma data válida.
- [x] Deve lançar um erro se a data da ação for superior a 30 dias no futuro.

### Validações de Mídia (Images)

- [x] Deve lançar um erro (ex: `MissingParamError` ou `InvalidMediaError`) se o array de imagens não for fornecido.
- [x] Deve lançar um erro se o array de imagens estiver vazio (0 itens).
- [x] Deve lançar um erro se o array de imagens contiver mais de 10 itens.
- [x] Deve lançar um erro se alguma das strings dentro do array de imagens for vazia ou inválida.

---

## 3. Caminhos Felizes (Happy Paths)

Estes testes garantem que o fluxo de sucesso funciona corretamente, interage com as dependências da forma esperada e devolve o contrato correto.

### Criação e Persistência

- [ ] Deve chamar o método `ContentRepository.save` exatamente uma vez quando todos os dados válidos forem fornecidos.
- [ ] Deve chamar o método `ContentRepository.save` passando a entidade `Content` instanciada com os dados corretos recebidos no DTO.
- [ ] Deve criar o conteúdo atribuindo um identificador único (ID) válido à entidade.
- [ ] Deve criar o conteúdo com o status inicial padrão correto (ex: `published` ou `active`).

### Variações de Dados Opcionais

- [ ] Deve registrar o conteúdo com sucesso mesmo quando o array de `participants` não for fornecido (campo opcional).
- [ ] Deve registrar o conteúdo com sucesso quando o array de `participants` for fornecido e preenchido.

### Formato de Saída (Output DTO)

- [ ] Deve retornar um objeto contendo o `id`, `title` e `status` em caso de sucesso.
- [ ] Não deve expor dados sensíveis ou desnecessários da entidade de domínio no retorno do caso de uso.

### Comportamento do Repositório (Falhas de Infraestrutura)

- [ ] Deve repassar a exceção (throw) se o `ContentRepository.save` falhar (ex: simulando uma queda de banco de dados durante o teste).
