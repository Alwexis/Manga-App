import { Component, OnInit } from '@angular/core';
import { MangaService } from './services/manga.service';
import { NetworkService } from './services/network.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private _network: NetworkService, private _storage: StorageService,
    private _manga: MangaService) {}

  async ngOnInit() {
    await this._storage.init();
    await this._manga.init();
    this._network.init();
  }

  async init() {
  }
}
