export class CreateUserFromGoogleCommand {
  constructor(
    private _id: string,
    private _firstName: string,
    private _familyName: string,
    private _email: string,
    private _role: string,
    private _imageUrl?: string,
  ) {}

  get firstName(): string {
    return this._firstName;
  }

  get familyName(): string {
    return this._familyName;
  }

  get role(): string {
    return this._role;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }
}
