import { Injectable } from '@angular/core';
import {
  DetectedObject,
  ObjectDetection,
  WorkerRequestLoadModelPayload,
  WorkerRequestPredictPayload,
  WorkerResponseMessage,
} from '.';
import { Observable, Subject, exhaustMap, filter, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CocossdWwService implements ObjectDetection {
  #worker!: Worker;
  #modelLoaded = false;

  constructor() {
    this.#worker = new Worker(new URL('./cocossd.worker', import.meta.url));
    this.#worker.onmessage = ({ data }: WorkerResponseMessage) => {
      if (data.type === 'modelLoaded') {
        this.#modelLoaded = data.success;
      }
    };
  }
  #requestPredictions$: Subject<ImageData> = new Subject();
  predictions$: Observable<DetectedObject[]> = this.#requestPredictions$
    .asObservable()
    .pipe(
      filter(() => this.#modelLoaded),
      exhaustMap((imageData) => {
        return this.sendRequestPredictions(imageData);
      })
    );

  initModel(): void {
    const request: WorkerRequestLoadModelPayload = { type: 'loadModel' };
    this.#worker.postMessage(request);
  }
  requestPredictions(imageData: ImageData): void {
    this.#requestPredictions$.next(imageData);
  }

  sendRequestPredictions(imageData: ImageData): Observable<DetectedObject[]> {
    return new Observable((subscriber) => {
      this.#worker.onmessage = ({ data }: WorkerResponseMessage) => {
        if (data.type === 'predictions') {
          subscriber.next(data.predictions);
          subscriber.complete();
        }
      };

      const request: WorkerRequestPredictPayload = {
        type: 'predict',
        imageData,
      };
      this.#worker.postMessage(request, [imageData.data.buffer]);

      return () => {
        this.#worker.onmessage = null;
      };
    });
  }
}
