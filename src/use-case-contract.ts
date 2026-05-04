export interface UseCase<input, output> {
  execute(input: input): Promise<output>
}
