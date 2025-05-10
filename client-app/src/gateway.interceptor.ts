import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class GatewayInterceptor implements NestInterceptor {
  //intercept methodu : gelen isteği yakalar ve yanıtı işlemek için kullanılır.
  intercept(
    context: ExecutionContext, //mevcut isteğin contextini temsil ediyor.
    next: CallHandler<any>, //bu istek zincirindeki bir sonraki handleri temsil ediyor
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      //chaining
      map((data) => {
        const response = context.switchToHttp().getResponse();

        response.setHeader('X-served-By', 'gateway');
        response.setHeader('X-Gateway-Timestamp', new Date().toISOString());

        return data; //not : farkettiyseniz burada gelen veriyi değiştirmiyoruz sadece yanıtın başlıklarına bazı özel başlıklar ekliyoruz.
      }),
    );
  }
}
