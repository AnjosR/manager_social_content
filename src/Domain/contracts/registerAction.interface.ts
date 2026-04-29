import type { RegisterActionInput, RegisterActionOutput } from '../dto/register-action.dto.js'

export interface RegisterAction {
  Register(input: RegisterActionInput): Promise<RegisterActionOutput>
}
