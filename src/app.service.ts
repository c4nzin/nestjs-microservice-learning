import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  accumulate(data: number[]) {
    return data.reduce((acc, num) => acc + num, 0);
  }

  handleUserCreatedEvent(data: any): void {
    console.log(
      `Mikroservisten gelen appService event : kullanıcı oluşturuldu ${data.name} , ${data.email}`,
    );
  }
}
