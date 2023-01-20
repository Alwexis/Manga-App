import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, AnimationController, ToastController } from '@ionic/angular';
import { Session } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import SwiperCore, { Autoplay, Pagination } from 'swiper';

SwiperCore.use([Autoplay, Pagination]);

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user: Session;
  seeingImage: boolean = false;
  private _swiper: any;
  private _currentCard: string = '';

  constructor(private _auth: AuthService, private _actionSheet: ActionSheetController,
    private _animCtrl: AnimationController, private _toastCtrl: ToastController,
    private _alertCtrl: AlertController) {
      this.user = this._auth.getSession();
  }

  ngOnInit() {
    if (this.user) {
      this.user = this._auth.getSession();
    }
  }

  setSwiperInstance(swiper: any) {
    this._swiper = swiper;
    this._swiper.slidesPerView = 1.5;
  }

  onSlideChange() {
    if (this._currentCard) this.playCardAnimation(this._currentCard, false);
  }

  async playCardAnimation(elementClass: string, forward: boolean) {
    const card = document.querySelector('.card.'+elementClass);
    const cardBack = document.querySelector('.card-back.'+elementClass);
    if (!card) return;
    if (!cardBack) return;
    if (this._currentCard !== '') {
      const pastCard = this._currentCard;
      this._currentCard = '';
      this.playCardAnimation(pastCard, false);
    }
    const cardAnimation = this._animCtrl.create()
      .duration(200)
      .iterations(1)
      .fromTo('transform', 'rotateY(0deg)', 'rotateY(90deg)')
      .fromTo('opacity', '1', '0')
      .afterStyles({ 'display': 'none' });
    const cardBackAnimation = this._animCtrl.create()
      .duration(200)
      .iterations(1)
      .fromTo('transform', 'rotateY(-90deg)', 'rotateY(0deg)')
      .fromTo('opacity', '0', '1')
      .beforeStyles({ 'display': 'initial' });
    if (forward) {
      cardAnimation.addElement(card)
      cardBackAnimation.addElement(cardBack)
      this._currentCard = elementClass;
    } else {
      cardAnimation.addElement(cardBack)
      cardBackAnimation.addElement(card)
      if (this._currentCard === elementClass) this._currentCard = '';
    }
    await cardAnimation.play();
    await cardBackAnimation.play();
  }

  async attemptChangePfp() {
    const actionSheet = await this._actionSheet.create({
      header: 'Profile Picture',
      subHeader: 'What do you want to do?',
      buttons: [],
      mode: 'ios',
    });
    if (this.user.image) {
      actionSheet.buttons = [
        {
          text: 'Delete',
          role: 'destructive',
          data: {
            action: 'delete'
          },
          handler: async () => {
            this.user.image = null;
            const user =  await this._auth.getUser(this.user.email);
            if (!user) return;
            user.image = null;
            await this._auth.updateUser(user);
          },
          icon: 'trash',
        },
        {
          text: 'Change',
          data: {
            action: 'change'
          },
          handler: async () => {
            document.getElementById('changePfpInput')?.click();
          },
          icon: 'swap-horizontal',
        },
        {
          text: 'See',
          data: {
            action: 'see'
          },
          handler: async () => {
            await this.imageViewerOn();
          },
          icon: 'image',
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel'
          }
        }
      ]
    } else {
      actionSheet.buttons = [
        {
          text: 'Upload',
          data: {
            action: 'upload'
          },
          handler: async () => {
            //await actionSheet.dismiss();
            document.getElementById('changePfpInput')?.click();
          },
          icon: 'push',
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel'
          }
        }
      ]
    }
    await actionSheet.present();
  }

  async imageChange(e: any) {
    const file = e.target.files[0];
    if (file.type.startsWith('image/')) {
      if (file.size > 5000000) {
        const alert = await this._alertCtrl.create({
          header: 'Image too big',
          subHeader: 'Max size is 5MB',
          message: 'The image you\'re trying to upload is too big, please try again with a smaller one.',
          buttons: ['OK'],
        });
        return await alert.present();
      } else if (file.type === 'image/gif' && !this.user.isPro) {
        const alert = await this._alertCtrl.create({
          header: 'You\'re not a supporter',
          subHeader: 'Only Supports can use GIFs',
          message: 'GIFs are not supported for people that aren\'t supporters. Please try again with another image type such as PNG or JPG, or become a supporter to use GIFs.',
          buttons: ['OK'],
        });
        return await alert.present();
      } else {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file);
        fileReader.onload = async () => {
          const base64 = fileReader.result?.toString();
          if (!base64) return;
          this.user.image = base64;
          const user =  await this._auth.getUser(this.user.email);
          if (!user) return;
          user.image = base64;
          const wasUpdated = await this._auth.updateUser(user);
          return wasUpdated;
        }
        fileReader.onerror = async () => {
          const alert = await this._alertCtrl.create({
            header: 'Error reading file',
            subHeader: 'Please try again',
            message: 'There was an error reading the file you\'ve selected, please try again.',
            buttons: ['OK'],
          });
          return await alert.present();
        }
      }
    } else {
      const alert = await this._alertCtrl.create({
        header: 'Invalid Image Format',
        subHeader: 'Were expecting a PNG, JPG or GIF file.',
        message: 'You have uploaded an invalid image format for Profile Picture, please try again with a valid one: PNG, JPG or GIF if you\'re supporter',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async imageViewerOn() {
    this.seeingImage = true;
    setTimeout(async () => {
      const bgElement = document.getElementById('image-viewer')
      if (!bgElement) {
        this.seeingImage = false;
        return;
      }
      const animationBg = this._animCtrl.create()
        .addElement(bgElement)
        .duration(200)
        .iterations(1)
        .fromTo('opacity', '0', '1')
      await animationBg.play();
    }, 10);
  }

  async clickedViewerOff(e: any) {
    if (e.target.tagName.toLowerCase() === 'section') {
      const bgElement = document.getElementById('image-viewer')
      if (!bgElement) return;
      const animationBg = this._animCtrl.create()
        .addElement(bgElement)
        .duration(200)
        .iterations(1)
        .fromTo('opacity', '1', '0')
        .afterAddWrite(() => {
          this.seeingImage = false;
        })
      await animationBg.play();
    }
  }


}
