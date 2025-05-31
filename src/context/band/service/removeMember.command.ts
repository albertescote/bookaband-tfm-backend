export class RemoveMemberCommand {
  constructor(
    public readonly bandId: string,
    public readonly userId: string,
    public readonly memberToRemoveId: string,
  ) {}
} 