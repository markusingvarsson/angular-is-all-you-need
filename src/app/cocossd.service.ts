import { Injectable } from '@angular/core';
import { DetectedObject, ObjectDetection } from '.';
import { Observable, Subject, exhaustMap, filter, from } from 'rxjs';
import { detect, loadCocoSSD } from './cocossd';

@Injectable({
  providedIn: 'root',
})
export class CocossdService implements ObjectDetection {
  #modelLoaded = false;
  #requestPredictions$: Subject<ImageData> = new Subject<ImageData>();
  predictions$: Observable<DetectedObject[]> = this.#requestPredictions$
    .asObservable()
    .pipe(
      filter(() => this.#modelLoaded),
      exhaustMap((imageData) => {
        return from(detect(this.#model, imageData));
      })
    );

  #model: unknown;

  initModel(): void {
    loadCocoSSD().then(({ success, model }) => {
      this.#modelLoaded = success;
      if (success) {
        this.#model = model;
      }
    });
  }
  requestPredictions(imageData: ImageData): void {
    this.#requestPredictions$.next(imageData);
  }
}
