import { Component, ElementRef, AfterViewInit, Output, EventEmitter, Inject } from '@angular/core';
import { CaptchaService } from '../../services/captcha-service/captcha.service';
import { environment } from 'src/environments/environment';

declare const turnstile: any;

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html'
})
export class CaptchaComponent implements AfterViewInit {
  @Output() tokenResolved = new EventEmitter<string>();

  constructor(private el: ElementRef, @Inject(CaptchaService) private captchaService: CaptchaService) {}

  async ngAfterViewInit() {
    await this.captchaService.loadScript();
    turnstile.render(this.el.nativeElement.querySelector('#cf-turnstile'), {
      sitekey: environment.siteKey,
      theme:'light',
      callback: (token: string) => this.tokenResolved.emit(token)
    });
  }
}
