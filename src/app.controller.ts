import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('sum')
  accumulate(data: number[]): number {
    return this.appService.accumulate(data);
  }

  //buradaki event patterni rabbitmq den gelen eventi dinlemek için kullanıyoruz.
  //çnemli not : event patternlar genelde tek yönlündür bir olayı dinler olayın gerçekleştğiğni bildirir.
  //db ye kayıt başka bir servise bildirim loglama vs.

  //burada event pattern user_created eventini dinliyoruz ve client tarafında client.emit('user_created, data) şeklinde bir olay gerçekleştiğine
  //rabbitmq bu mesajı kuyruğa alır ve ana microservis bu kuyruktan gelen eventa bakar 'user_created' ile eşleşiyorsa
  //buradaki handleUserCreatedEvent metodu tetiklenecek.

  //@Payload() decoratoru ise data transform işlemlerini yapıyor diyebilirm.
  //veriyi method parametresine enjekte etmek için kullanıyoruz ve clientin emit ile gönderdiği veriyi
  //mesela name : 'can', email : 'squalcan@gmail.com' olar gibi bir nesne olarak alıyoruz.
  @EventPattern('user_created')
  async handleUserCreatedEvent(@Payload() data: any) {
    this.appService.handleUserCreatedEvent(data);
  }
}
