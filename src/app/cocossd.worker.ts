/// <reference lib="webworker" />

import {
  WorkerRequestMessage,
  WorkerResponseModelLoadedPayload,
  WorkerResponsePredictionsPayload,
} from '.';
import { detect, loadCocoSSD } from './cocossd';

let cocossdModel: unknown;

addEventListener('message', async ({ data }: WorkerRequestMessage) => {
  switch (data.type) {
    case 'loadModel':
      const { model, success } = await loadCocoSSD();
      cocossdModel = model;
      const loadModelResponse: WorkerResponseModelLoadedPayload = {
        type: 'modelLoaded',
        success,
      };
      postMessage(loadModelResponse);
      break;
    case 'predict':
      const predictions = await detect(cocossdModel, data.imageData);
      const predictionsResponse: WorkerResponsePredictionsPayload = {
        type: 'predictions',
        predictions,
      };
      postMessage(predictionsResponse);
      break;
    default:
      break;
  }
});
