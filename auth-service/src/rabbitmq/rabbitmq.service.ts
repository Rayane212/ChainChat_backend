import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage, Options } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;

  async onModuleInit() {
    this.connection = connect(['amqp://rayane:Rayane14102002@localhost:5672'], {
      reconnectTimeInSeconds: 5,
    });

    this.channel = this.connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        console.log('✅ RabbitMQ connecté et channel prêt');
        await channel.assertQueue('auth_queue', { durable: true });
      },
    });

    console.log('✅ AuthService connecté à RabbitMQ et écoute auth_queue');
  }



  async send(queue: string, message: any) {
    await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      deliveryMode: 2, // ✅ Correction : Ne pas utiliser persistent: true
    } as Options.Publish);
    console.log(`📤 Message envoyé à ${queue}:`, message);
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
    console.log('❌ Connexion RabbitMQ fermée pour AuthService');
  }
}