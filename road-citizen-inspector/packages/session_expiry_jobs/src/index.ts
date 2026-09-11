import type { Channel, Replies } from "amqplib";
import { connect } from "amqplib";

type SessionExpiryMessage = {
  session_id: number;
  expiration_ms?: number;
};
type SessionExpiryClientOptions = {
  url: string;
  exchange: string;
  queue: string;
  expirationMs: number;
  messagesPersistent?: boolean;
  queuesDurable?: boolean;
};

class SessionExpiryClient {
  private q: Replies.AssertQueue | undefined;
  private ch: Channel | undefined;
  private opts: SessionExpiryClientOptions;

  constructor(options: SessionExpiryClientOptions) {
    this.opts = {
      ...options,
      messagesPersistent: options.messagesPersistent ?? false,
      queuesDurable: options.queuesDurable ?? false,
    };
    this.q = undefined;
    this.ch = undefined;
  }

  async init() {
    if (this.ch) return;
    const connection = await connect(this.opts.url);
    const channel = await connection.createChannel();

    const _assertedExchange = await channel.assertExchange(
      this.opts.exchange,
      "x-delayed-message",
      {
        durable: this.opts.queuesDurable,
        arguments: {
          "x-delayed-type": "direct",
        },
      },
    );

    const assertedQueue = await channel.assertQueue(this.opts.queue, {
      durable: this.opts.queuesDurable,
    });

    channel.bindQueue(assertedQueue.queue, this.opts.exchange, "");
    this.ch = channel;
    this.q = assertedQueue;
  }

  async close() {
    if (this.ch) await this.ch.close();
  }

  sendSession(msg: SessionExpiryMessage): Promise<void> {
    if (!this.ch) {
      throw new Error(
        "Session Expiry Client is not initialized. Channel is not defined.",
      );
    }

    const processedMsg: SessionExpiryMessage = {
      ...msg,
      expiration_ms: msg.expiration_ms ?? this.opts.expirationMs,
    };

    const payload = Buffer.from(JSON.stringify(processedMsg));

    return new Promise((resolve, reject) => {
      const ok = this.ch!.publish(this.opts.exchange, "", payload, {
        contentType: "application/json",
        persistent: this.opts.messagesPersistent,
        headers: { "x-delay": processedMsg.expiration_ms },
      });

      if (!ok) reject("Failed to publish message.");
      resolve();
    });
  }

  async receiveSession(
    handler: (s: SessionExpiryMessage) => Promise<boolean>,
  ): Promise<void> {
    if (!this.q || !this.ch) throw new Error("Client not initialized");

    this.ch.consume(this.q.queue, async (msg) => {
      if (!msg) return;
      const msgContent = Buffer.from(msg.content).toString();
      const session = JSON.parse(msgContent) as SessionExpiryMessage;

      await handler(session);
    });
  }
}

export { SessionExpiryClient };
export type { SessionExpiryMessage, SessionExpiryClientOptions };
