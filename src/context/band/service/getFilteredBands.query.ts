export class GetFilteredBandsQuery {
  constructor(
    private _userId: string,
    private _page: number,
    private _pageSize: number,
    private _filters: {
      location: string;
      artistName: string;
      date: string;
      timeZone: string;
    },
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

  get filters(): {
    location: string;
    artistName: string;
    date: string;
    timeZone: string;
  } {
    return this._filters;
  }
}
