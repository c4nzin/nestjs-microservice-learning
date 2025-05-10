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
//api gateway olmadan yapılan işlemler meslea şöyle olurdu :
//Client A -----> microservice 1
//Client A -----> microservice 2

//client b -----> microservice 2
//client b -----> microservice 5

//api gateway ile yapılan işlemler ise şöyle olurdu teorik olarak bakarsak :
//Client a -----> API gateway -----> microservice 1
//                            -----> mciroservice 2
//                            -----> microservice 3

//Client b -----> API gateway -----> microservice 2
//                            -----> microservice 5

//not : clientlar sadece api gatewayin adresini bilirler ve gateway gelen isteği alır hangi microservise yönlendirceğine karar verir kısaca.
//single point of entry : clientların tüm microservislerin adreslerini bilmesine gerek kalmaz sadece gatewayin adresini bilmeleri yeterlidir
//request routing : gateway gelen isteğin urline http methoduna veya headera bakarak isteği doğru microservise yönlendirir
//mseela users ile ilgili istekler varsa User microservisine yönlendirir
//orders ile alakalı bişey varsa Order microservisine yönlendirir

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
