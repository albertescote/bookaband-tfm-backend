import {BadRequestException} from '../../../app/api/exceptions/badRequestException';

export class InvalidRoleForRequestedClientException extends BadRequestException {
  constructor(id: string) {
    super(`The requested client doesn't has the role of client: ${id}`);
  }
}
