export interface Controller<SignInBody, SignInResponse> {
  handle(input: SignInBody): Promise<SignInResponse>
}
