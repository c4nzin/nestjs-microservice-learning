import {
  Serializer,
  Deserializer,
  ReadPacket,
  WritePacket,
} from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

interface CustomMessageWrapper {
  payload: any; //burada nestjs tarafından orjinial mesajı alıyoruz (pattern falan)
  metadata: {
    //mesajla ilgili ek bilgileri ekliyoruz buraya
    timestamp: string; //eventin mesajın ne zaman gönderildiği
    sourceService: string; //mesajı gönderen servis kim onu anlamamız için bir metadatada alanı ekliyoruzz
    correlationId?: string; //mesajın hangi isteğe ait olduğunu anlamak için kullanıyoruz
    traceId?: string; //izlenebilrilik için kullanıyoruz ama gerek yok ekstra yapılan bir alan unqieue bir id gibi düşün.
  };
}

export class CustomSerializerDeserializer implements Serializer, Deserializer {
  private readonly logger: Logger;
  private readonly serviceName: string; //burada hangi servisin işlem yaptığını anlamak için prop ekeldik.

  constructor(serviceName: string = 'UnknownService') {
    this.serviceName = serviceName;
    this.logger = new Logger(
      `${CustomSerializerDeserializer.name} (${this.serviceName})`,
    );
    this.logger.log(
      `servisi için yeni bir instance oluşturduk :  : : : : :${this.serviceName}.`,
    );
  }

  serialize(value: any): WritePacket {
    this.logger.log(
      `serialzie yapmak için işlem başlatılıyor: ${JSON.stringify(value)}`,
    );
    const wrappedMessage: CustomMessageWrapper = {
      payload: value, //burada orijinal mesajı alıyoruz
      metadata: {
        timestamp: new Date().toISOString(),
        sourceService: this.serviceName,
        correlationId: value?.id,
        traceId:
          value?.traceId ||
          `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      },
    };
    const serializedString = JSON.stringify(wrappedMessage);
    this.logger.log(`Serialized to: ${serializedString}`);
    return { response: serializedString }; //burada mesajı response ile wraplayıp dönüyorum burası önemli WritePacket içinden gelen
    //response alanına yazıyorum f12 ile bakabilirsiniz source koda.
  }

  deserialize(value: any): ReadPacket {
    this.logger.log(`deserialize yapılıyor: ${JSON.stringify(value)}`);

    let messageToParse: string;

    if (
      typeof value === 'object' &&
      value !== null &&
      typeof value.response === 'string'
    ) {
      messageToParse = value.response;
    } else if (Buffer.isBuffer(value)) {
      messageToParse = value.toString();
    } else if (typeof value === 'string') {
      messageToParse = value;
    } else {
      this.logger.error('deserialize yapılamadı');
    }

    try {
      const wrappedMessage: CustomMessageWrapper = JSON.parse(messageToParse);
      this.logger.log(
        `deserialize yapılmış mesaj: ${JSON.stringify(wrappedMessage)}`,
      );
      this.logger.log(
        `deserialize metadata :: ${JSON.stringify(wrappedMessage.metadata)}`,
      );

      const originalMessage = wrappedMessage.payload;
      this.logger.log(
        `Orjinal value payload: ${JSON.stringify(originalMessage)}`,
      );
      return originalMessage;
    } catch (error) {
      throw new Error(`Deserialize yapılırken hata oluştu: ${error.message}`);
    }
  }
}
