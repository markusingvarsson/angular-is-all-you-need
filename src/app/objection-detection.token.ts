import { InjectionToken } from '@angular/core';
import { ObjectDetection } from '.';
import { CocossdService } from './cocossd.service';

export const OBJECT_DETECTION_TOKEN = new InjectionToken<ObjectDetection>(
  'OBJECT_DETECTION_TOKEN',
  {
    providedIn: 'root',
    factory: () => {
      return new CocossdService();
    },
  }
);
