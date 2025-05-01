import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ResetPasswordRepository } from "../infrastructure/resetPassword.repository";
import { GetResetPasswordSessionQuery } from "./getResetPasswordSession.query";
import SessionId from "../domain/sessionId";
import { ResetPasswordSessionPrimitives } from "../domain/resetPasswordSession";

@Injectable()
@QueryHandler(GetResetPasswordSessionQuery)
export class GetResetPasswordSessionQueryHandler
  implements IQueryHandler<GetResetPasswordSessionQuery>
{
  constructor(private resetPasswordRepository: ResetPasswordRepository) {}

  async execute(
    query: GetResetPasswordSessionQuery,
  ): Promise<ResetPasswordSessionPrimitives> {
    const resetPasswordSession = await this.resetPasswordRepository.getByKey(
      new SessionId(query.id),
    );

    return resetPasswordSession
      ? resetPasswordSession.toPrimitives()
      : undefined;
  }
}
