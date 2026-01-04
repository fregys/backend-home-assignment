import { Car } from './Car.js';
import { CarSnapshot } from './types/car.js';
import { CONFIG } from './config/config.js';

import * as mqtt from 'mqtt';
import * as amqp from 'amqplib';


async function main() {
    // First initialize the rabbitmq to not waste resources on mqtt
    const connection = await amqp.connect(CONFIG.RABBIT_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(CONFIG.QUEUE_NAME, { durable: true });
    console.log('Connected to RabbitMQ');

    const client = mqtt.connect(CONFIG.MQTT_BROKER_URL);
    const myCar = new Car(1);
    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        client.subscribe('car/1/#');
    });

    client.on("message", (topic, message) => {
        myCar.updateFromMqtt(topic, message);
    });

    setInterval(() => {
        try {
            const snapshot : CarSnapshot = myCar.getSnapshot();
            const messageBuffer = Buffer.from(JSON.stringify(snapshot));

            const isSent = channel.sendToQueue(CONFIG.QUEUE_NAME, messageBuffer, {
                persistent: true
            });

            if (isSent) {
                console.log("Sent Snapshot to RabbitMQ:", snapshot);
            } else {
                console.warn("RabbitMQ buffer is full!");
            }
        } catch (err) {
            // If we can't send to Rabbit, we should probably crash and let Docker restart
            console.error("Fatal error sending to RabbitMQ:", err);
            process.exit(1);
        }
    }, CONFIG.INTERVAL_MS);
}

main().catch(err => {
    console.error("Fatal collector error occurred:", err);
    process.exit(1);
});