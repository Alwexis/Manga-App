import { Component, OnInit, ViewChild } from '@angular/core';
import { AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {

  private _loading: boolean = true;
  private _activeTab: string = 'home';

  constructor(private _animationCtrl: AnimationController) {}

  async ngOnInit() {
    document.querySelectorAll('ion-tab-button').forEach((tab: any) => {
      tab.classList.add('inactive-tab');
    });
    document.querySelector('.home-tab')?.classList.remove('inactive-tab');
    setTimeout(() => { this._loading = false; }, 100);
  }

  async tabChange(e: any) {
    if (this._loading) return;
    this.playTabAnimation(this._activeTab, false);
    this.playTabAnimation(e.tab, true);
    this._activeTab = e.tab;
  }

  async playTabAnimation(tab: string, selected: boolean) {
    const tabButton = document.querySelector(`.${tab}-tab`);
    const label = tabButton?.querySelector('ion-label');
    if (tabButton && label) {
      const animation = this._animationCtrl.create()
        .addElement(label)
        .duration(200)
        .iterations(1)
      if (selected) {
        animation.fromTo('opacity', '0', '1')
          .beforeAddWrite(() => {
            tabButton.classList.remove('inactive-tab');
          })
          .easing('ease-in');
      } else {
        animation.fromTo('opacity', '1', '0')
          .afterAddWrite(() => {
            tabButton.classList.add('inactive-tab');
          })
          .easing('ease-out');
      }
      await animation.play();
    }
  }

}
