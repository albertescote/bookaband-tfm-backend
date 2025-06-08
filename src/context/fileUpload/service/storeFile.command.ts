export class StoreFileCommand {
  constructor(
    private _fileName: string,
    private _fileContent: Buffer,
  ) {}

  get fileName(): string {
    return this._fileName;
  }

  get fileContent(): Buffer {
    return this._fileContent;
  }
}
