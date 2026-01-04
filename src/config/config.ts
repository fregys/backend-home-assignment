// In production I would load the credentials through dotenv or uncommited file
// but since those are default credentials I decided not to care about it 💅
export const CONFIG = {
    MQTT_BROKER_URL: 'mqtt://localhost:51883',
    RABBIT_URL: 'amqp://admin:admin@localhost:55672',
    QUEUE_NAME: 'car_data',
    POSTGRES_URL: 'postgres://postgres:postgres@localhost:55432/postgres',
    INTERVAL_MS: 5000,
}