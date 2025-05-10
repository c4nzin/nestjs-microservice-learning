import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GatewayInterceptor } from './gateway.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //burada yazdıgımız gateway interceptor, gelen isteklerin başlıklarına bazı özel başlıklar ekliyor.
  app.useGlobalInterceptors(new GatewayInterceptor());
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
