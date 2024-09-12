import {BadRequestException} from '../../../app/api/exceptions/badRequestException';

export class InvalidClientIdException extends BadRequestException {
  constructor(id: string) {
    super(`Client not found for this id: ${id}`);
  }
}
