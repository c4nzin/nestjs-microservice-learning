import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CustomSerializerDeserializer } from './custom.serializer';
import { LoggerMiddleware } from './logger.middleware';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'main_queue', //mesajların gönderileceği alınacağı kuyruk adı. queue
          queueOptions: {
            durable: false, //rabbitmq için kuyrukların kalıcı olup olmadığını burada belirtebiliyoruz.
          },

          //burada yazdığımız özel serialzier ve deserialzier instanceleri
          serializer: new CustomSerializerDeserializer('main_service'),
          deserializer: new CustomSerializerDeserializer('main_service'),
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
