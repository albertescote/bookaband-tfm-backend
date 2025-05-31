import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class AtLeastOneAdminRequiredException extends BadRequestException {
  constructor() {
    super("At least one admin is required to perform this action.");
  }
}
