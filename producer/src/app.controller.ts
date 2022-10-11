import { Controller, Get, Inject, OnModuleDestroy, OnModuleInit, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientKafka } from '@nestjs/microservices';
import { createClient } from 'redis';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Promiser } from './promiser'

@Controller()
export class AppController implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly appService: AppService,
    @Inject('any_name_i_want') private readonly client: ClientKafka,
  ) { }

  async onModuleInit() {
    ['kafka-topic'].forEach((key) => this.client.subscribeToResponseOf(`${key}`));
    await this.client.connect();
  }


  @Post('async-to-sync')
  async testKafkaWithResponse(@Req()request: Request, @Res() response: Response) {
    const reqId = uuidv4();

    this.client.emit('kafka-topic', { id: reqId, data: new Date().toString(), payload: request.body });
    let res = await this.asyncToSync(reqId);

    return response.status(res.code).json(res.message).send();
  }

  async asyncToSync(reqId: any): Promise<any> {
    
    const client = createClient();
    const subscriber = client.duplicate();
    await subscriber.connect();
    
    const promiser = new Promiser<any>();
    await subscriber.subscribe('response', (message) => {
      message = JSON.parse(message);
      if(reqId === message['id']) {
        subscriber.unsubscribe();
        promiser.resolve({
          code: HttpStatus.OK,
          message: message['payload']
        });
      }
    });

    setTimeout(() => {
      subscriber.unsubscribe();
      promiser.resolve({
        code: HttpStatus.REQUEST_TIMEOUT,
        message: "TIMEOUT"
      });
    }, 1000);

    return promiser.promise;
  }
}
