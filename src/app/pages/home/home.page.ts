import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnimationController, LoadingController } from '@ionic/angular';
import { MangaService } from 'src/app/services/manga.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  private _swiper: any;
  actualSegment = 'all';
  mangas: any = [];
  loading = true;

  constructor(private _animationCtrl: AnimationController, private _mangaService: MangaService,
    private _loadingCtrl: LoadingController) { }

  async ngOnInit() {
    const loadingEffect = await this._loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
      duration: 999999999999,
    });
    await loadingEffect.present();
    const mangas = await this._mangaService.getMangas();
    if (mangas.length < 1) {
      this._mangaService.onMangasFetch.subscribe(async (mangas: any) => {
        console.log('Loaded!')
        this.mangas = mangas;
        this.loading = false;
        await loadingEffect.dismiss();
      });
    } else {
      this.mangas = mangas;
      this.loading = false;
      await loadingEffect.dismiss();
    }
  }

  setSwiperInstance(swiper: any) {
    this._swiper = swiper;
  }

  onSegmentChange(e: any) {
    this.actualSegment = e.detail.value;
    this._swiper.slideTo(this.actualSegment === 'all' ? 0 : 1);
  }

  onSlideChange(e: any) {
    this._swiper.activeIndex === 1 ? this.actualSegment = 'by-genres' : this.actualSegment = 'all';
    const segment = document.querySelector('ion-segment');
    if (segment) segment.value = this.actualSegment;
  }

}
