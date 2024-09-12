import { OfferRepository } from "../../../../src/context/offer/infrastructure/offerRepository";
import Offer from "../../../../src/context/offer/domain/offer";
import OfferId from "../../../../src/context/offer/domain/offerId";
import UserId from "../../../../src/context/shared/domain/userId";
import OfferPrice from "../../../../src/context/offer/domain/offerPrice";

describe("Offer Repository should", () => {
  const offerRepository = new OfferRepository();

  it("CRUD for offer object", () => {
    const ownerId = UserId.generate();
    const clientId = UserId.generate();
    const newOffer: Offer = new Offer(
      OfferId.generate(),
      "description",
      ownerId,
      new OfferPrice(500),
    );

    const addedOffer = offerRepository.addOffer(newOffer);

    expect(addedOffer).toStrictEqual(newOffer);
    let allOffers = offerRepository.getAllOffers();
    expect(allOffers.length).toStrictEqual(1);
    expect(allOffers[0]).toStrictEqual(newOffer);

    const newUpdatedOffer = new Offer(
      OfferId.generate(),
      "description-2",
      ownerId,
      new OfferPrice(700),
    );
    const updatedOffer = offerRepository.updateOffer(
      new OfferId(addedOffer.toPrimitives().id),
      newUpdatedOffer,
    );

    expect(updatedOffer).toStrictEqual(newUpdatedOffer);
    const storedOffer = offerRepository.getOfferById(
      new OfferId(newUpdatedOffer.toPrimitives().id),
    );
    expect(storedOffer).toStrictEqual(newUpdatedOffer);

    const deleted = offerRepository.deleteOffer(
      new OfferId(updatedOffer.toPrimitives().id),
    );
    expect(deleted).toBeTruthy();

    allOffers = offerRepository.getAllOffers();
    expect(allOffers.length).toStrictEqual(0);
  });
});
