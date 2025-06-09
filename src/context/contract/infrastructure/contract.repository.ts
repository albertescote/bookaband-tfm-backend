import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Contract } from "../domain/contract";
import ContractId from "../../shared/domain/contractId";
import BandId from "../../shared/domain/bandId";
import BookingId from "../../shared/domain/bookingId";

@Injectable()
export class ContractRepository {
  private readonly prisma = new PrismaClient();

  async findById(id: ContractId): Promise<Contract | undefined> {
    const contract = await this.prisma.contract.findUnique({
      where: { id: id.toPrimitive() },
      include: {
        booking: {
          select: {
            name: true,
            initDate: true,
            band: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                firstName: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return contract
      ? Contract.fromPrimitives({
          id: contract.id,
          bookingId: contract.bookingId,
          status: contract.status,
          fileUrl: contract.fileUrl,
          userSigned: contract.userSigned,
          bandSigned: contract.bandSigned,
          createdAt: contract.createdAt,
          updatedAt: contract.updatedAt,
          vidsignerDocGui: contract.vidsignerDocGui,
          eventName: contract.booking.name,
          bandName: contract.booking.band.name,
          userName:
            contract.booking.user.firstName +
            " " +
            contract.booking.user.familyName,
          eventDate: contract.booking.initDate,
        })
      : undefined;
  }

  async findByBookingId(id: BookingId): Promise<Contract | undefined> {
    const contract = await this.prisma.contract.findUnique({
      where: { bookingId: id.toPrimitive() },
      include: {
        booking: {
          select: {
            name: true,
            initDate: true,
            band: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                firstName: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return contract
      ? Contract.fromPrimitives({
          id: contract.id,
          bookingId: contract.bookingId,
          status: contract.status,
          fileUrl: contract.fileUrl,
          userSigned: contract.userSigned,
          bandSigned: contract.bandSigned,
          createdAt: contract.createdAt,
          updatedAt: contract.updatedAt,
          vidsignerDocGui: contract.vidsignerDocGui,
          eventName: contract.booking.name,
          bandName: contract.booking.band.name,
          userName:
            contract.booking.user.firstName +
            " " +
            contract.booking.user.familyName,
          eventDate: contract.booking.initDate,
        })
      : undefined;
  }

  async findBookingBandIdByContractId(contractId: string): Promise<string> {
    const result = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        booking: {
          select: {
            bandId: true,
          },
        },
      },
    });
    if (!result) return undefined;

    return result.booking.bandId;
  }

  async findManyByUserId(userId: string): Promise<Contract[]> {
    const contracts = await this.prisma.contract.findMany({
      where: {
        booking: {
          userId: userId,
        },
      },
      include: {
        booking: {
          select: {
            name: true,
            initDate: true,
            band: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                firstName: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return contracts.map((contract) =>
      Contract.fromPrimitives({
        id: contract.id,
        bookingId: contract.bookingId,
        status: contract.status,
        fileUrl: contract.fileUrl,
        userSigned: contract.userSigned,
        bandSigned: contract.bandSigned,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        vidsignerDocGui: contract.vidsignerDocGui,
        eventName: contract.booking.name,
        bandName: contract.booking.band.name,
        userName:
          contract.booking.user.firstName +
          " " +
          contract.booking.user.familyName,
        eventDate: contract.booking.initDate,
      }),
    );
  }

  async findManyByBandId(bandId: BandId): Promise<Contract[]> {
    const contracts = await this.prisma.contract.findMany({
      where: {
        booking: {
          bandId: bandId.toPrimitive(),
        },
      },
      include: {
        booking: {
          select: {
            name: true,
            initDate: true,
            band: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                firstName: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return contracts.map((contract) =>
      Contract.fromPrimitives({
        id: contract.id,
        bookingId: contract.bookingId,
        status: contract.status,
        fileUrl: contract.fileUrl,
        userSigned: contract.userSigned,
        bandSigned: contract.bandSigned,
        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,
        vidsignerDocGui: contract.vidsignerDocGui,
        eventName: contract.booking.name,
        bandName: contract.booking.band.name,
        userName:
          contract.booking.user.firstName +
          " " +
          contract.booking.user.familyName,
        eventDate: contract.booking.initDate,
      }),
    );
  }

  async create(contract: Contract): Promise<Contract> {
    const contractPrimitives = contract.toPrimitives();
    const created = await this.prisma.contract.create({
      data: {
        id: contractPrimitives.id,
        bookingId: contractPrimitives.bookingId,
        status: contractPrimitives.status,
        fileUrl: contractPrimitives.fileUrl,
        userSigned: contractPrimitives.userSigned,
        bandSigned: contractPrimitives.bandSigned,
        vidsignerDocGui: contractPrimitives.vidsignerDocGui,
        createdAt: contractPrimitives.createdAt,
        updatedAt: contractPrimitives.updatedAt,
      },
      include: {
        booking: {
          select: {
            name: true,
            initDate: true,
            band: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                firstName: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return Contract.fromPrimitives({
      id: created.id,
      bookingId: created.bookingId,
      status: created.status,
      fileUrl: created.fileUrl,
      userSigned: created.userSigned,
      bandSigned: created.bandSigned,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      vidsignerDocGui: created.vidsignerDocGui,
      eventName: created.booking.name,
      bandName: created.booking.band.name,
      userName:
        created.booking.user.firstName + " " + created.booking.user.familyName,
      eventDate: created.booking.initDate,
    });
  }

  async update(contract: Contract): Promise<Contract> {
    const updated = await this.prisma.contract.update({
      where: { id: contract.toPrimitives().id },
      data: contract.toPrimitives(),
      include: {
        booking: {
          select: {
            name: true,
            initDate: true,
            band: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                firstName: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return Contract.fromPrimitives({
      id: updated.id,
      bookingId: updated.bookingId,
      status: updated.status,
      fileUrl: updated.fileUrl,
      userSigned: updated.userSigned,
      bandSigned: updated.bandSigned,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      vidsignerDocGui: updated.vidsignerDocGui,
      eventName: updated.booking.name,
      bandName: updated.booking.band.name,
      userName:
        updated.booking.user.firstName + " " + updated.booking.user.familyName,
      eventDate: updated.booking.initDate,
    });
  }

  async delete(id: ContractId): Promise<void> {
    await this.prisma.contract.delete({
      where: { id: id.toPrimitive() },
    });
  }

  async findByVidSignerDocGui(docGui: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { vidsignerDocGui: docGui },
      include: {
        booking: {
          select: {
            name: true,
            initDate: true,
            band: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                firstName: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return contract
      ? Contract.fromPrimitives({
          id: contract.id,
          bookingId: contract.bookingId,
          status: contract.status,
          fileUrl: contract.fileUrl,
          userSigned: contract.userSigned,
          bandSigned: contract.bandSigned,
          createdAt: contract.createdAt,
          updatedAt: contract.updatedAt,
          vidsignerDocGui: contract.vidsignerDocGui,
          userName:
            contract.booking.user.firstName +
            " " +
            contract.booking.user.familyName,
        })
      : undefined;
  }
}
