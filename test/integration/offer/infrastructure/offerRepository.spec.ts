import { OfferRepository } from "../../../../src/context/offer/infrastructure/offer.repository";
import Offer from "../../../../src/context/offer/domain/offer";
import OfferId from "../../../../src/context/offer/domain/offerId";
import UserId from "../../../../src/context/shared/domain/userId";
import OfferPrice from "../../../../src/context/offer/domain/offerPrice";
import { MusicGenre } from "../../../../src/context/offer/domain/musicGenre";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import User from "../../../../src/context/shared/domain/user";
import { Role } from "../../../../src/context/shared/domain/role";

describe("Offer Repository should", () => {
  const prismaService = new PrismaService();
  const offerRepository = new OfferRepository(prismaService);

  const offerId = OfferId.generate();
  const ownerId = UserId.generate();

  beforeAll(async () => {
    const user = new User(
      ownerId,
      "John",
      "Doe",
      "email@example.com",
      "1234",
      Role.Musician,
    );
    await prismaService.user.create({ data: user.toPrimitives() });
  });

  afterAll(async () => {
    await prismaService.user.delete({ where: { id: ownerId.toPrimitive() } });
    await prismaService.onModuleDestroy();
  });

  it("CRUD for offer object", async () => {
    const newOffer: Offer = new Offer(
      offerId,
      ownerId,
      new OfferPrice(500),
      "band-name",
      MusicGenre.POP,
      "description",
      "image-url",
    );

    const addedOffer = await offerRepository.addOffer(newOffer);

    expect(addedOffer).toStrictEqual(newOffer);
    let allOffers = await offerRepository.getAllOffers();
    expect(allOffers.length).toStrictEqual(1);
    expect(allOffers[0]).toStrictEqual(newOffer);

    const newUpdatedOffer = new Offer(
      offerId,
      ownerId,
      new OfferPrice(500),
      "band-name-2",
      MusicGenre.ROCK,
      "description-2",
      "image-url-2",
    );
    const updatedOffer = await offerRepository.updateOffer(
      new OfferId(addedOffer.toPrimitives().id),
      newUpdatedOffer,
    );

    expect(updatedOffer).toStrictEqual(newUpdatedOffer);
    const storedOffer = await offerRepository.getOfferById(
      new OfferId(newUpdatedOffer.toPrimitives().id),
    );
    expect(storedOffer).toStrictEqual(newUpdatedOffer);

    const deleted = await offerRepository.deleteOffer(
      new OfferId(updatedOffer.toPrimitives().id),
    );
    expect(deleted).toBeTruthy();

    allOffers = await offerRepository.getAllOffers();
    expect(allOffers.length).toStrictEqual(0);
  });
});
