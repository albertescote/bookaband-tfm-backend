import { Injectable } from "@nestjs/common";
import {
  MusicalStyle,
  MusicalStylePrimitives,
} from "../../shared/domain/musicalStyle";
import { MusicalStyleRepository } from "../infrastructure/musicalStyle.repository";
import MusicalStyleId from "../domain/musicalStyleId";

export interface CreateMusicalStyleRequest {
  label: Record<string, string>;
  icon: string;
}

export interface UpdateMusicalStyleRequest {
  id: string;
  label: Record<string, string>;
  icon: string;
}

@Injectable()
export class MusicalStyleService {
  constructor(private readonly repository: MusicalStyleRepository) {}

  async create(
    createMusicalStyleRequest: CreateMusicalStyleRequest,
  ): Promise<MusicalStylePrimitives> {
    const createdMusicalStyle = await this.repository.create(
      MusicalStyle.create(
        createMusicalStyleRequest.label,
        createMusicalStyleRequest.icon,
      ),
    );
    return createdMusicalStyle.toPrimitives();
  }

  async getById(id: string): Promise<MusicalStylePrimitives> {
    const musicalStyleFound = await this.repository.getById(
      new MusicalStyleId(id),
    );
    return musicalStyleFound.toPrimitives();
  }

  async getAll(): Promise<MusicalStylePrimitives[]> {
    const allMusicalStylesFound = await this.repository.getAll();
    return allMusicalStylesFound.map((musicalStyle) => {
      return musicalStyle.toPrimitives();
    });
  }

  async update(
    updateMusicalStyleRequest: UpdateMusicalStyleRequest,
  ): Promise<MusicalStylePrimitives> {
    const updatedMusicalStyle = await this.repository.update(
      MusicalStyle.fromPrimitives(updateMusicalStyleRequest),
    );
    return updatedMusicalStyle.toPrimitives();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(new MusicalStyleId(id));
  }
}
