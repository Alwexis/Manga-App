import { EventEmitter, Injectable } from '@angular/core';

import { Network } from '@capacitor/network';
import { ConnectionStatus } from '@capacitor/network/dist/esm/definitions';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private _initializated: boolean = false;
  onNetworkChange: EventEmitter<ConnectionStatus> = new EventEmitter<ConnectionStatus>();

  constructor() { }

  init() {
    this._initializated = true;
    Network.addListener('networkStatusChange', (status) => {
      console.log("Network status changed", status);
      this.onNetworkChange.emit(status);
    });
  }

  getNetworkStatus() {
    if (!this._initializated) {
      this.init();
    }
    return Network.getStatus();
  }
}
