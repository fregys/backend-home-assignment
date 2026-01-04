import * as amqp from 'amqplib';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { carState } from './schemas/car.js';
import { CarSnapshot } from './types/car.js';
import { CONFIG } from "./config/config.js";

const pool = new Pool({ connectionString: CONFIG.POSTGRES_URL });
const db = drizzle(pool);

async function saveToDatabase(data: CarSnapshot) {
    await db.insert(carState).values({
        carId: data.car_id,
        time: new Date(data.time),
        stateOfCharge: data.state_of_charge,
        latitude: data.latitude,
        longitude: data.longitude,
        gear: data.gear,
        speed: data.speed
    });

    console.log(`Saved snapshot for Car ${data.car_id}`);
}

async function setupRabbitMQ(onMessage: (data: CarSnapshot) => Promise<void>) {
    const connection = await amqp.connect(CONFIG.RABBIT_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(CONFIG.QUEUE_NAME, { durable: true });

    // To prevent memory crash in case of a lot of messages in the queue
    await channel.prefetch(1);

    channel.consume(CONFIG.QUEUE_NAME, async (msg) => {
        if (msg) {
            try {
                const content: CarSnapshot = JSON.parse(msg.content.toString());
                await onMessage(content);
                channel.ack(msg);
            } catch (err) {
                console.error("Error processing message:", err);
                // retry instead of losing the message
                // in real life I would implement handler for poisoned messages
                channel.nack(msg, false, true);
            }
        }
    });
}

async function main() {
    await setupRabbitMQ(saveToDatabase);
}

main().catch((err) => {
    console.error("Fatal writer error occurred:", err);
    process.exit(1);
});