import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserQuery } from "./user.query";
import { UserRepository } from "../infrastructure/user.repository";
import User from "../../shared/domain/user";
import UserId from "../../shared/domain/userId";

@Injectable()
@QueryHandler(UserQuery)
export class UserQueryHandler implements IQueryHandler<UserQuery> {
  constructor(private userRepository: UserRepository) {}

  async execute(query: UserQuery): Promise<User> {
    if (query.id) {
      return await this.userRepository.getUserById(new UserId(query.id));
    }
    if (query.email) {
      return this.userRepository.getUserByEmail(query.email);
    }
  }
}
