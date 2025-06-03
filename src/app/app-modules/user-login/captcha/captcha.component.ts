import {
  Component,
  ElementRef,
  AfterViewInit,
  Output,
  EventEmitter,
  Inject,
  OnDestroy,
} from '@angular/core';
import { CaptchaService } from '../../services/captcha-service/captcha.service';
import { environment } from 'src/environments/environment';

declare const turnstile: any;

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html',
})
export class CaptchaComponent implements AfterViewInit, OnDestroy {
  @Output() tokenResolved = new EventEmitter<string>();
  private widgetId: string | null = null;

  constructor(
    private el: ElementRef,
    @Inject(CaptchaService) private captchaService: CaptchaService,
  ) {}

  async ngAfterViewInit() {
    try {
      await this.captchaService.loadScript();

      const captchaElement =
        this.el.nativeElement.querySelector('#cf-turnstile');
      if (!captchaElement) {
        console.error('CAPTCHA container element not found');
        return;
      }

      this.widgetId = turnstile.render(captchaElement, {
        sitekey: environment.siteKey,
        theme: 'light',
        callback: (token: string) => this.tokenResolved.emit(token),
      });
    } catch (error) {
      console.error('Failed to initialize CAPTCHA:', error);
    }
  }

  ngOnDestroy() {
    if (this.widgetId && typeof turnstile !== 'undefined' && turnstile.remove) {
      turnstile.remove(this.widgetId);
    }
  }
}
