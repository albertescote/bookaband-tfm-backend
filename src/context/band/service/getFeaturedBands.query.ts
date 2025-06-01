export class GetFeaturedBandsQuery {
  constructor(
    private _userId: string,
    private _page: number,
    private _pageSize: number,
  ) {}

  get userId(): string {
    return this._userId;
  }

  get page(): number {
    return this._page;
  }

  get pageSize(): number {
    return this._pageSize;
  }
}
