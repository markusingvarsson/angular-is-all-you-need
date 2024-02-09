import { AfterViewInit, Component } from '@angular/core';
import { VideoComponent } from './video.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VideoComponent],
  template: `<h1>Angular Is All You Need!</h1>
    @if(stream) {
    <app-video [stream]="stream"></app-video>}`,
  styles: ``,
})
export class AppComponent implements AfterViewInit {
  stream!: MediaStream;

  ngAfterViewInit() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream;
      })
      .catch((error) => {
        console.error('ooops', error);
      });
  }
}
