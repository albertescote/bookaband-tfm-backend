import OfferId from '../../../../src/context/offer/domain/offerId';
import { validate } from 'uuid';

describe('OfferId should', () => {
  it('generate a random 10 digit value', () => {
    const offerId = OfferId.generate();
    const valid = validate(offerId.toPrimitive());

    expect(valid).toBeTruthy();
  });

  it('throw an error for an invalid input', () => {
    expect(() => new OfferId('uuid')).toThrow();
  });
});
