import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitMqClient: ClientRMQ,
  ) {}

  //burada OnModuleInit i implement ettik çünkü buradaki amacım şuan yaptıgım clientin rabbitmq ile bağlantısını kurmak.
  async onModuleInit() {
    try {
      await this.rabbitMqClient.connect();
      console.log('RabbitMQ client bağlantısı gerçekelşti.');
    } catch (error) {
      console.error('RabbitMQ client bağlantıısı kurulamadı.', error);
    }
  }
  getHello(): string {
    return 'Hello World!';
  }

  async sumNumbers(data: number[]): Promise<number> {
    try {
      console.log(`'sum' commandı yollandı.`, data);

      const result = await firstValueFrom(
        this.rabbitMqClient.send<number, number[]>('sum', data),
      );

      return result;
    } catch (error) {
      console.error('yollandırken hata oluştu', error);
      throw error;
    }
  }

  async publishUserCreatedEvent(data: any) {
    if (!this.rabbitMqClient) {
      console.error('Rabbitmq bağlantısı kurulmamış.');
      return;
    }

    console.log(`'user_created' eventi yollandı.`, data);

    await this.rabbitMqClient.emit('user_created', data);
  }

  //burada bazı docler onmoduledestroy ile bağlantının kapatılmasını öneriyor
  //bkz : https://sivabharathy.in/blog/rabbitmq-implementation-in-nestjs/

  async onModuleDestroy() {
    await this.rabbitMqClient.close();
    //try catch ile yapıladabilir.
  }
}
