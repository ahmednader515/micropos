declare module 'quagga' {
  interface QuaggaConfig {
    inputStream: {
      name: string;
      type: string;
      target?: HTMLElement;
      constraints?: {
        width?: number | { min: number; ideal: number; max: number };
        height?: number | { min: number; ideal: number; max: number };
        facingMode?: string;
        aspectRatio?: number | { min: number; max: number };
      };
    };
    locator: {
      patchSize: string;
      halfSample: boolean;
    };
    numOfWorkers: number;
    frequency: number;
    decoder: {
      readers: string[];
    };
    locate: boolean;
  }

  interface QuaggaResult {
    codeResult: {
      code: string;
      format: string;
    };
  }

  interface QuaggaProcessedResult {
    codeResult?: {
      code: string;
      format: string;
    };
  }

  const Quagga: {
    init(config: QuaggaConfig, callback: (err: any) => void): void;
    start(): void;
    stop(): void;
    onDetected(callback: (result: QuaggaResult) => void): void;
    offDetected(callback: (result: QuaggaResult) => void): void;
    onProcessed(callback: (result: QuaggaProcessedResult) => void): void;
  };

  export default Quagga;
} 