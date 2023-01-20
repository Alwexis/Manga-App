import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class MangaService {

  private _mangas: any = [];
  onMangasFetch: EventEmitter<any> = new EventEmitter();

  constructor(private _db: DbService, private _http: HttpClient) { }

  async init() {
    await this.fetchMangas();
  }

  private async fetchMangas() {
    //this._mangas = await this._db.get('mangas');
    this._mangas = await this._http.get('http://127.0.0.1:3000/mangas?orderby=title&ordertype=asc').toPromise();
    this.onMangasFetch.emit(await this._mangas);
  }

  async getMangas() {
    if (!this._mangas) {
      await this.fetchMangas();
      return;
    }
    return this._mangas;
  }
}
