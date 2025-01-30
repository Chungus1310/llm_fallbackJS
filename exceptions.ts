export class AllProvidersFailedError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AllProvidersFailedError';
    }
  }