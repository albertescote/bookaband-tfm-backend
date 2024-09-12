import {InvalidOfferPriceFormatException} from "../exceptions/invalidOfferPriceFormatException";

export default class OfferPrice {
    constructor(private value: number) {
        if (value < 0) {
            throw new InvalidOfferPriceFormatException(value);
        }
    }

    toPrimitive(): number {
        return this.value;
    }
}
