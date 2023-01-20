import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { Session, User } from '../interfaces/user';
import { DbService } from './db.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  session: Session = { username: '', alias: '', image: '', email: '', isUploader: false, isCreator: false, isPro: false };

  private _LOGIN_URL_ = 'http://localhost:3000/login';

  constructor(private _storage: StorageService, private _network: NetworkService,
    private _db: DbService, private _http: HttpClient, private _toastCtrl: ToastController,
    private _navCtrl: NavController, private _alertCtrl: AlertController) {
      this._storage.getData('session').then((session: Session) => {
        this.session = session;
      });
    }

  async isAuthenticated() {
    const isAuth = await this._storage.getData('session');
    return isAuth ? true : false;
  }

  getSession() {
    return this.session;
  }

  async doesExist(email: string) {
    const networkStatus = await this._network.getNetworkStatus();
    if (networkStatus.connected) {
      const doesExist = await this._db.get('user', [`email=${email}`]) as [];
      if (doesExist.length === 0) {
        return { error: false };
      }
      return { error: true, title: 'Already Registered', message: 'An user with that email is already registered on our app.' };
    }
    return { error: true, title: 'No internet connection', message: 'You need to have a stable internet connection to register in our platform.' };
  }

  async register(user: User) {
    const networkStatus = await this._network.getNetworkStatus();
    if (networkStatus.connected) {
      const doesExist = await this._db.get('user', [`email=${user.email}`]) as [];
      if (doesExist.length === 0) {
        const newUser: any = await this._db.insertOne('user', user);
        if (newUser) {
          let userData = await this._storage.getData('users');
          if (!userData) {
            userData = await this._storage.addData('users', new Map<string, User>());
          }
          userData.set(newUser.email, newUser);
          await this._storage.addData('users', userData);
          const session: Session = {
            username: newUser.username,
            alias: newUser.alias,
            image: newUser.image,
            email: newUser.email,
            isUploader: newUser.isUploader,
            isCreator: newUser.isCreator,
            isPro: newUser.isPro,
          }
          await this._storage.addData('session', session);
          return { error: false };
        }
        return { error: true, title: 'Unknown error' };
      }
      return { error: true, title: 'Already Registered', message: 'An user with that email is already registered on our app.' };
    }
    return { error: true, title: 'No internet connection', message: 'You need to have a stable internet connection to register in our platform.' };
  }

  async login(credentials: { email: string, password: string }) {
    const networkStatus = await this._network.getNetworkStatus();
    if (networkStatus.connected) {
      const isLoggedIn: any = await this._http.post(this._LOGIN_URL_, 
        {credentials: { email: credentials.email, password: credentials.password }}).toPromise();
      if (isLoggedIn.isAuth) {
        const session = await this._storage.addData('session', isLoggedIn.session);
        this.session = session;
        //* Adding user to local storage, so we allow offline access
        const users = await this._storage.getData('users');
        users.set(credentials.email, isLoggedIn.user);
        await this._storage.addData('users', users);
        //
        const toast = await this._toastCtrl.create({
          message: 'Logged in!',
          duration: 2000,
        });
        await toast.present();
        return { error: false };
      } else {
        const alert = await this._alertCtrl.create({
          header: 'Couldnt log in',
          message: 'Wrong email or password',
          buttons: ['OK']
        });
        await alert.present();
        return { error: true, title: 'Couldnt log in', message: 'Wrong email or password' };
      }
    } else {
      const alert = await this._alertCtrl.create({
        header: 'No internet connection',
        subHeader: 'Couldnt log in',
        message: 'You need to have a stable internet connection to register in our platform.',
        buttons: ['OK']
      });
      await alert.present();
      return { error: true, title: 'No internet connection', message: 'You need to have a stable internet connection to register in our platform.' };
    }
  }

  async getUser(email: string) {
    const networkStatus = await this._network.getNetworkStatus();
    if (networkStatus.connected) {
      const rawUser: any = await this._db.get('user', [`email=${email}`]);
      if (!rawUser) return;
      const user = rawUser[0] as User;
      return user;
    }
    return null;
  }

  async updateUser(user: User) {
    const updatedUser: User = await this._db.updateOne('user', ['correo=' + user.email], user) as User;
    if (this.session.email === updatedUser.email) {
      this.session = {
        username: updatedUser.username,
        alias: updatedUser.alias,
        email: updatedUser.email,
        image: updatedUser.image,
        isUploader: updatedUser.isUploader,
        isPro: updatedUser.isPro,
        isCreator: updatedUser.isCreator,
      }
      await this._storage.addData('session', this.session);
    }
    return updatedUser;
  }

  async verifyEmail(email: string, username: string) {
    const networkStatus = await this._network.getNetworkStatus();
    if (networkStatus.connected) {
      const code = Math.random().toString(36).substring(2, 9).toUpperCase();
      const emailBody = {
        type: 'verification',
        to: email,
        templateOptions: {
          code: code,
          username: username
        },
      }
      this._http.post('http://localhost:3000/mail', emailBody).toPromise();
      return { error: false, code: code };
    }
    return { error: true, title: 'No internet connection', message: 'You need to have a stable internet connection to register in our platform.' };
  }
}
