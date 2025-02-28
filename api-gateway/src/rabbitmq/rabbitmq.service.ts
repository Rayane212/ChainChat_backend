import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, AmqpConnectionManager, ChannelWrapper, Options } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private connection: AmqpConnectionManager;
    private channel: ChannelWrapper;
    private responseQueue: string;
    private responses = new Map<string, (value: any) => void>();

    async onModuleInit() {
        try {
            this.connection = connect(['amqp://rayane:Rayane14102002@localhost:5672'], {
                reconnectTimeInSeconds: 5,
            });

            this.channel = this.connection.createChannel({
                json: true,
                setup: async (channel: ConfirmChannel) => {
                    this.responseQueue = `amq.rabbitmq.reply-to`; // Utilisation de la queue spéciale pour RPC
                    await channel.consume(
                        this.responseQueue,
                        (msg: ConsumeMessage) => {
                            if (msg !== null) {
                                const correlationId = msg.properties.correlationId;
                                if (correlationId && this.responses.has(correlationId)) {
                                    const response = JSON.parse(msg.content.toString());
                                    this.responses.get(correlationId)(response);
                                    this.responses.delete(correlationId);
                                }
                            }
                        },
                        { noAck: true }
                    );
                },
            });

            console.log('✅ API Gateway connecté à RabbitMQ avec support RPC');
        } catch (error) {
            console.error('❌ Erreur de connexion à RabbitMQ:', error);
        }
    }

    async sendRpc(queue: string, message: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const correlationId = uuidv4();
                console.log(`📤 Envoi message RPC à ${queue}:`, message);
    
                this.responses.set(correlationId, resolve);
    
                this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                    deliveryMode: 2,
                    replyTo: this.responseQueue,
                    correlationId,
                } as Options.Publish);
    
                setTimeout(() => {
                    if (this.responses.has(correlationId)) {
                        this.responses.delete(correlationId);
                        reject(new Error('⏳ Timeout: Pas de réponse de ' + queue));
                    }
                }, 5000);
            } catch (error) {
                console.error('❌ Erreur lors de l\'envoi RPC:', error);
                reject(error);
            }
        });
    }

    async onModuleDestroy() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('❌ Connexion RabbitMQ fermée pour API Gateway');
        } catch (error) {
            console.error('❌ Erreur lors de la fermeture de RabbitMQ:', error);
        }
    }
}