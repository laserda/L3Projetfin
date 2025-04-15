import { Injectable } from '@nestjs/common';

@Injectable()
export class StatistiquesService {
  async getStats() {
    return {
      naissances: 500,
      mariages: 100,
      décès: 50,
    };
  }
}
