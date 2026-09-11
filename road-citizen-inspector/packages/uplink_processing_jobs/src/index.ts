import { connect, type Channel, type Replies } from "amqplib";

type UplinkProcessorMessage = {
  uplink_id: number;
};
type UplinkProcessorClientOptions = {
  url: string;
  exchange: string;
  queue: string;
  messagesPersistent?: boolean;
  queuesDurable?: boolean;
};

class UplinkProcessorClient {
  private q?: Replies.AssertQueue;
  private ch?: Channel;
  private opts: UplinkProcessorClientOptions;

  constructor(options: UplinkProcessorClientOptions) {
    this.opts = {
      ...options,
      messagesPersistent: options.messagesPersistent ?? true,
      queuesDurable: options.queuesDurable ?? true,
    };
  }

  async init() {
    if (this.ch) return;

    const connection = await connect(this.opts.url);
    const channel = await connection.createChannel();

    const _assertExchange = await channel.assertExchange(
      this.opts.exchange,
      "direct",
      { durable: this.opts.queuesDurable }
    );

    const assertedQueue = await channel.assertQueue(this.opts.queue, {
      durable: this.opts.queuesDurable,
    });

    channel.bindQueue(assertedQueue.queue, this.opts.exchange, "", {
      durable: this.opts.queuesDurable,
    });

    this.ch = channel;
    this.q = assertedQueue;
  }

  async close() {
    if (this.ch) await this.ch.close();
  }

  sendUplink(msg: UplinkProcessorMessage): Promise<void> {
    if (!this.ch || !this.q) throw new Error("Client not initialized");

    const payload = Buffer.from(JSON.stringify(msg));

    return new Promise((resolve, reject) => {
      const ok = this.ch!.publish(this.opts.exchange, "", payload, {
        contentType: "application/json",
        persistent: this.opts.messagesPersistent,
      });

      if (!ok) reject("Failed to publish message");
      resolve();
    });
  }

  async receiveUplink(
    handler: (u: UplinkProcessorMessage) => Promise<boolean>
  ): Promise<void> {
    if (!this.ch || !this.q) throw new Error("Client not initialized");

    await this.ch!.consume(
      this.q.queue,
      async (msg) => {
        if (!msg) return;
        let ok = false;
        try {
          const payload = JSON.parse(
            msg.content.toString()
          ) as UplinkProcessorMessage;
          ok = await handler(payload);
        } catch (e) {
          ok = false; // treat as failure
        } finally {
          if (ok) this.ch!.ack(msg);
          else this.ch!.nack(msg, false, false); // no requeue by default
        }
      },
      { noAck: false }
    );
  }
}

export { UplinkProcessorClient };
export type { UplinkProcessorMessage, UplinkProcessorClientOptions };
