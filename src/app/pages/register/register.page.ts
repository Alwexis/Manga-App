import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  credentials = {
    username: '',
    alias: '',
    email: '',
    password: '',
  }

  user: User = {
    username: '',
    alias: '',
    image: null,
    email: '',
    password: '',
    creationDate: null,
    activated: false,
    isUploader: false,
    isCreator: false,
    isPro: false,
    lastLogin: null,
    lastPasswordChange: null,
    lastEmailChange: null,
    lastEmailVerificationCode: null
  }

  code: string = '';

  constructor(private _network: NetworkService, private _alertCtrl: AlertController,
    private _router: Router, private _auth: AuthService, private _navCtrl: NavController,
    private _toastCtrl: ToastController) { }

  async ngOnInit() {
    const status = await this._network.getNetworkStatus();
    if (!status.connected) {
      const alert = await this._alertCtrl.create({
        header: 'No internet connection',
        subHeader: "You can't register right now",
        message: 'In order to register in our platform, you need to have a stable internet connection. Please, try again later.',
        buttons: [
          {
            text: 'Ok',
            role: 'ok',
            handler: () => {
              this._router.navigate(['/login']);
              alert.dismiss();
            }
          }
        ],
        backdropDismiss: true,
        keyboardClose: true
      });
      await alert.present();
    }
  }

  async register() {
    this.user.username = this.credentials.username;
    this.user.alias = this.credentials.alias;
    this.user.email = this.credentials.email;
    this.user.password = this.credentials.password;
    this.user.creationDate = new Date();
    const registered = await this._auth.doesExist(this.user.email);
    console.log(registered)
    if (registered.error === false) {
      console.log('hola')
      //this._navCtrl.navigateRoot('/home');
      const code = await this._auth.verifyEmail(this.user.email, this.user.username) as { error: boolean, code: string };
      this.code = code.code;
      console.log(code);
      console.log(this.code)
      const alert = await this._alertCtrl.create({
        header: 'Verification code',
        subHeader: 'Please, check your email',
        message: 'We have sent you a verification code to your email. Please, enter it below.',
        inputs: [
          {
            name: 'code',
            id: 'code',
            type: 'text',
            placeholder: 'AABBCCDDEE',
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              alert.dismiss();
            }
          },
          {
            text: 'Ok',
            handler: async (data) => {
              if (data.code === this.code) {
                const newUser = await this._auth.register(this.user);
                alert.dismiss();
                this._navCtrl.navigateRoot('/home');
                const toast = await this._toastCtrl.create({
                  message: 'You have successfully registered in our platform',
                  duration: 3000,
                  position: 'bottom',
                  color: 'success'
                });
                await toast.present();
              } else {
                alert.dismiss();
                this._alertCtrl.create({
                  header: 'Wrong code',
                  subHeader: 'The code you entered is wrong',
                  message: 'Please, enter the code we sent you to your email.',
                  buttons: [
                    {
                      text: 'Ok',
                      role: 'ok',
                      handler: () => {
                        alert.dismiss();
                      }
                    }
                  ],
                  backdropDismiss: true,
                  keyboardClose: true
                });
              }
            },
          }
        ],
      });
      await alert.present();
    } else {
      const alert = await this._alertCtrl.create({
        header: registered.title,
        subHeader: 'There was an error registering your account',
        message: registered.message,
        buttons: [
          {
            text: 'Ok',
            role: 'ok',
            handler: () => {
              alert.dismiss();
            }
          }
        ],
      });
      await alert.present();
    }
  }

}
