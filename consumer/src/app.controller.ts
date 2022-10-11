import { Controller } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

import { createClient } from 'redis';
const publisher = createClient();

@Controller()
export class AppController {
  constructor() {
  }

  @MessagePattern('kafka-topic')
  async readMessage(@Payload() message: any, @Ctx() context: KafkaContext) {
    const originalMessage = context.getMessage();
    const response =
      `Receiving a new message from topic: kafka-topic: ` +
      JSON.stringify(originalMessage.value);

    await publisher.connect();

    await publisher.publish('response', JSON.stringify(originalMessage.value));
    publisher.disconnect();
    
    return response;
  }
}
