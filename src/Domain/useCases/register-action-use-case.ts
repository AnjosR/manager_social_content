import type { RegisterAction } from '../contracts/registerAction.interface.js'
import type { UseCase } from '../contracts/use-case.interface.js'
import type { RegisterActionInput, RegisterActionOutput } from '../dto/register-action.dto.js'
import { Action } from '../entities/action.js'

export class RegisterActionUseCase implements UseCase<RegisterActionInput, RegisterActionOutput> {
  constructor(private readonly registerAction: RegisterAction) {}

  async execute(input: RegisterActionInput): Promise<RegisterActionOutput> {
    const action = new Action(input.title, input.description, input.images, input.actionDate)

    // Depois usarei o "action"

    const result = await this.registerAction.Register(input)
    return result
  }
}
