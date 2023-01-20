import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  hasConnection: boolean = false;

  constructor(private _auth: AuthService, private _network: NetworkService,
    private _alertCtrl: AlertController, private _navCtrl: NavController,
    private _loadingCtrl: LoadingController) { }

  async ngOnInit() {
    const networkStatus = await this._network.getNetworkStatus();
    this.hasConnection = networkStatus.connected;
    if (!networkStatus.connected) {
      const alert = await this._alertCtrl.create({
        header: 'Unable to Log In',
        subHeader: 'No Internet Connection',
        message: 'You need to be connected to a stable internet connection in orden to log in. Please try again later.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async login() {
    const loading = await this._loadingCtrl.create({
      message: 'Logging In...',
      spinner: 'crescent',
      duration: 999999999999,
    });
    await loading.present();
    const loggedIn = await this._auth.login({ email: this.email, password: this.password})
    if (!loggedIn.error) {
      await this._navCtrl.navigateRoot('/');
      await loading.dismiss();
    }
  }

}
