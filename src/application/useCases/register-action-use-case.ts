import { Action } from '#src/Domain/entities/action'

import type { RegisterAction } from '../../application/contracts/registerAction.interface.js'
import type { UseCase } from '../../application/contracts/use-case.interface.js'
import type { RegisterActionInput, RegisterActionOutput } from '../../application/dto/register-action.dto.js'

export class RegisterActionUseCase implements UseCase<RegisterActionInput, RegisterActionOutput> {
  constructor(private readonly registerAction: RegisterAction) {}

  async execute(input: RegisterActionInput): Promise<RegisterActionOutput> {
    const _action = new Action(input.title, input.description, input.images, input.actionDate)

    // Depois usarei o "action"

    const result = await this.registerAction.Register(input)
    return result
  }
}
