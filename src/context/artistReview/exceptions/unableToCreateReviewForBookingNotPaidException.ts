import { BadRequestException } from "../../../app/exceptions/badRequestException";

export class UnableToCreateReviewForBookingNotPaidException extends BadRequestException {
  constructor(bookingId: string) {
    super(
      `Unable to create a review for a booking that is not paid: ${bookingId}`,
    );
  }
}
