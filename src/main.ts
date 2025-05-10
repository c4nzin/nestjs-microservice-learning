import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CustomSerializerDeserializer } from './custom.serializer';

//serializer :
//bir microservisten dışarıya gönderilecek mesajları (mesela:: : bir clienta yanıt veya başka bir servise gönderilen bir olay),
//mesajlaşma sistemi üzerinden (kafka, rabbitmq falan) dışarıya iletilebilecek bir formata dönüştüren bir yapı.
//mesela şöyle olabilir : bir js nesnesini json stringine dönüştürmek veya protocol buffer ile binary bir formata dönüştürmek.

//deserializer :
//mesajlaşma sisteminden gelen native mesajları (genelde string veya Buffer formatında oluyorlar),
//uygulamanın anlayabileceği bir javascript nesnessine dönğüştürüen bir yapı
//kısaca gelen mesajlar için kullanacağız

//api gateway nedir :
//api gateway tüm client isteklerini için tek bir giriş noktası olarak görev yapan bir sunucudur.
//clientlar doğrudan microservislerlere bağlanmak yerine api gatewaye bağlanır api gateway daha sonra bu istekleri
//uygun microservislere yönlendirir ve yanıtları toplar clienta geri gönderir.

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ, //burada transportu rabbitmq olarak belirtmemiz gerkeiyor.
      options: {
        urls: ['amqp://localhost:5672'], //burada ise rabbitmq default url portu veriyoruz localhost için. kendi rabbitmq sunucunuz varsa buraya ekleybiilrisiniz.
        queue: 'main_queue',
        queueOptions: {
          durable: false,
        },
        serializer: new CustomSerializerDeserializer('main_service'),
        deserializer: new CustomSerializerDeserializer('main_service'),
      },
    },
  );

  await app.listen();
}
bootstrap();
