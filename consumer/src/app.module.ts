import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'kafka-module',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'my-client-id',
            brokers: ['localhost:29092'],
          },
          consumer: {
            groupId: 'my-consumer-group',
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
