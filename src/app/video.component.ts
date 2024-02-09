import { AsyncPipe, PercentPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { Observable } from 'rxjs';
import { DetectedObject } from '.';
import { CocossdService } from './cocossd.service';
import { OBJECT_DETECTION_TOKEN } from './objection-detection.token';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [AsyncPipe, PercentPipe],
  template: `
    <video
      (loadeddata)="startAnimationFrameLoop()"
      autoplay
      width="640"
      height="480"
      #videoRef
    ></video>
    @for(prediction of predictions$ | async; track $index) {
    <div>{{ prediction.class }} - {{ prediction.score | percent }}</div>
    } @empty{
    <div class="loader"></div>
    }
  `,
  styles: ``,
})
export class VideoComponent implements AfterViewInit {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @Input({ required: true }) stream!: MediaStream;
  objectDetectionService = inject(OBJECT_DETECTION_TOKEN);

  predictions$: Observable<DetectedObject[]> =
    this.objectDetectionService.predictions$;

  // helper variables
  lastTimeFrame: number = 0;
  predictionsPerSecond: number = 5;
  offscreenCanvas!: HTMLCanvasElement;

  ngAfterViewInit(): void {
    this.videoRef.nativeElement.srcObject = this.stream;
    this.objectDetectionService.initModel();
  }

  startAnimationFrameLoop() {
    const animate = (time: number) => {
      if (time - this.lastTimeFrame > 1000 / this.predictionsPerSecond) {
        this.lastTimeFrame = time;
        this.requestPredictions();
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  requestPredictions() {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.videoRef.nativeElement.videoWidth;
    this.offscreenCanvas.height = this.videoRef.nativeElement.videoHeight;

    const context = this.offscreenCanvas.getContext('2d');
    context?.drawImage(this.videoRef.nativeElement, 0, 0);
    const imageData = context?.getImageData(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );
    if (imageData) {
      this.objectDetectionService.requestPredictions(imageData);
    }
  }
}
