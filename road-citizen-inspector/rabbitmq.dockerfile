FROM rabbitmq:4.1.4-management

ENV RABBITMQ_DEFAULT_USER rci
ENV RABBITMQ_DEFAULT_PASS cyrus

# Install curl (Debian-based image)
RUN apt-get update && apt-get install -y curl \
  && rm -rf /var/lib/apt/lists/*

# Put the plugin where RabbitMQ actually looks
RUN curl -L \
  -o /opt/rabbitmq/plugins/rabbitmq_delayed_message_exchange-4.1.0.ez \
  https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v4.1.0/rabbitmq_delayed_message_exchange-4.1.0.ez

RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange