import {
  Serializer,
  Deserializer,
  ReadPacket,
  WritePacket,
} from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

interface CustomMessageWrapper {
  payload: any;
  metadata: {
    timestamp: string;
    sourceService: string;
    correlationId?: string;
    traceId?: string;
  };
}

export class CustomSerializerDeserializer implements Serializer, Deserializer {
  private readonly logger: Logger;
  private readonly serviceName: string;

  constructor(serviceName: string = 'UnknownService') {
    this.serviceName = serviceName;
    this.logger = new Logger(
      `${CustomSerializerDeserializer.name} (${this.serviceName})`,
    );
    this.logger.log(`Instance created for ${this.serviceName}.`);
  }

  serialize(value: any): WritePacket {
    this.logger.log(`Attempting to serialize: ${JSON.stringify(value)}`);
    const wrappedMessage: CustomMessageWrapper = {
      payload: value,
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
    return { response: serializedString };
  }

  deserialize(value: any): ReadPacket {
    this.logger.log(
      `Attempting to deserialize raw input value: ${JSON.stringify(value)}`,
    );

    let messageToParse: string;

    if (
      typeof value === 'object' &&
      value !== null &&
      typeof value.response === 'string'
    ) {
      // Eğer NestJS mesajı { response: "stringified_message" } şeklinde sarmalamışsa
      this.logger.warn(
        `Input value was wrapped in { response: "..." }. Unwrapping.`,
      );
      messageToParse = value.response;
    } else if (Buffer.isBuffer(value)) {
      messageToParse = value.toString();
    } else if (typeof value === 'string') {
      messageToParse = value;
    } else {
      this.logger.error(
        `Unexpected raw value type: ${typeof value}. Value: ${JSON.stringify(value)}`,
      );
      throw new Error(
        `Unexpected raw value type for deserialization: ${typeof value}`,
      );
    }

    this.logger.log(`Message string to parse: ${messageToParse}`);

    try {
      const wrappedMessage: CustomMessageWrapper = JSON.parse(messageToParse);
      this.logger.log(
        `Deserialized wrapped message: ${JSON.stringify(wrappedMessage)}`,
      );
      this.logger.log(
        `Extracted metadata: ${JSON.stringify(wrappedMessage.metadata)}`,
      );

      const originalMessage = wrappedMessage.payload;
      this.logger.log(
        `Returning original message to NestJS: ${JSON.stringify(originalMessage)}`,
      );
      return originalMessage;
    } catch (error) {
      this.logger.error(
        `Error parsing JSON: ${error.message}. Message string was: ${messageToParse}`,
      );
      throw new Error(
        `Deserialization failed: ${error.message}. Ensure message is a valid JSON string of CustomMessageWrapper.`,
      );
    }
  }
}
