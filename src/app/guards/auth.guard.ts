import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private _auth: AuthService, private _navCtrl: NavController) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    return await this.checkAuth();
  }

  private async checkAuth() {
    const isAuthenticated = await this._auth.isAuthenticated();
    console.log(isAuthenticated)
    return isAuthenticated || this.routeToLogin();
  }

  private routeToLogin() {
    this._navCtrl.navigateRoot('/login');
    return false;
  }
  
}
