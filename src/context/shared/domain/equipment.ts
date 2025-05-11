export enum EquipmentType {
  SoundEquipment = "hasSoundEquipment",
  Lighting = "hasLighting",
  Microphone = "hasMicrophone",
}

export interface EquipmentPrimitives {
  id: string;
  type: string;
  offerId: string;
}

export class Equipment {
  constructor(
    private readonly id: string,
    private readonly type: EquipmentType,
    private readonly offerId: string,
  ) {}

  public static fromPrimitives(primitives: EquipmentPrimitives): Equipment {
    if (
      !Object.values(EquipmentType).includes(primitives.type as EquipmentType)
    ) {
      throw new Error(`Invalid equipment type: ${primitives.type}`);
    }

    return new Equipment(
      primitives.id,
      primitives.type as EquipmentType,
      primitives.offerId,
    );
  }

  public toPrimitives(): EquipmentPrimitives {
    return {
      id: this.id,
      type: this.type,
      offerId: this.offerId,
    };
  }

  public getId(): string {
    return this.id;
  }

  public getType(): EquipmentType {
    return this.type;
  }

  public getOfferId(): string {
    return this.offerId;
  }
}
