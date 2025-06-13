import MusicalStyleId from "../../musicalStyle/domain/musicalStyleId";
import { MusicalStyleIcon } from "../../musicalStyle/domain/musicalStyleIcon";
import { MusicalStyleLabel } from "../../musicalStyle/domain/musicalStyleLabel";

export interface MusicalStylePrimitives {
  id: string;
  label: Record<string, string>;
  icon: string;
}

export class MusicalStyle {
  constructor(
    private readonly id: MusicalStyleId,
    private readonly label: MusicalStyleLabel,
    private readonly icon: MusicalStyleIcon,
  ) {}

  public static fromPrimitives(
    primitives: MusicalStylePrimitives,
  ): MusicalStyle {
    return new MusicalStyle(
      new MusicalStyleId(primitives.id),
      new MusicalStyleLabel(primitives.label),
      new MusicalStyleIcon(primitives.icon),
    );
  }

  static create(label: Record<string, string>, icon: string): MusicalStyle {
    return new MusicalStyle(
      MusicalStyleId.generate(),
      new MusicalStyleLabel(label),
      new MusicalStyleIcon(icon),
    );
  }

  public toPrimitives(): MusicalStylePrimitives {
    return {
      id: this.id.toPrimitive(),
      label: this.label.toPrimitives(),
      icon: this.icon.toPrimitives(),
    };
  }

  public getId(): MusicalStyleId {
    return this.id;
  }

  public getLabel(): MusicalStyleLabel {
    return this.label;
  }

  public getIcon(): MusicalStyleIcon {
    return this.icon;
  }
}
