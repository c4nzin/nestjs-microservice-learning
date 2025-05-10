import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('sum')
  async sum(@Body() data: { numbers: number[] }): Promise<{ result: number }> {
    console.log('sum endpointi çağrıldı.', data);

    //basit bir kondisyon ekleyelim
    if (!data || !Array.isArray(data.numbers)) {
      throw new Error('Geçersiz veri formatı. numberi dizi olarak yollayın.');
    }

    const sumResult = await this.appService.sumNumbers(data.numbers);

    return { result: sumResult };
  }

  @Get('sum')
  async sumGet(
    @Query('numbers') numbersStr: string,
  ): Promise<{ result: number }> {
    if (!numbersStr) {
      throw new Error('Geçersiz veri formatı. numberi dizi olarak yollayın.');
    }

    const numbers = numbersStr
      .split(',')
      .map((num) => parseInt(num.trim(), 10));

    if (numbers.some(isNaN)) {
      throw new Error('Geçersiz veri formatı. numberi dizi olarak yollayın.');
    }

    const sumResult = await this.appService.sumNumbers(numbers);

    return { result: sumResult };
  }

  @Post('users')
  async createUser(@Body() data: { name: string; email: string }) {
    console.log('Body user', data);
    await this.appService.publishUserCreatedEvent(data);
  }
}
