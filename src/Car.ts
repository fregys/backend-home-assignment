export class Car {
    public readonly id: number;
    private latitude: number = 0;
    private longitude: number = 0;
    private speedMs: number = 0;
    private gear: number = 0;
    private batteries: Map<number, { soc: number; capacity: number }> = new Map();

    constructor(id: number) {
        this.id = id;
    }

    updateFromMqtt(topic: string, message: Uint8Array) {
        const parts = topic.split('/');
        const data = JSON.parse(message.toString());
        const value = data.value
        const topicType = parts[2];

        switch (topicType) {
            case "speed":
                this.speedMs = parseFloat(value);
                break;
            case "gear":
                this.gear = value === 'N' ? 0 : parseInt(value);
                break;
            case "location":
                if (parts[3] === "latitude") this.latitude = parseFloat(value);
                if (parts[3] === "longitude") this.longitude = parseFloat(value);
                break;
            case "battery":
                this.updateBattery(parseInt(parts[3]), parts[4], parseFloat(value));
                break;
        }
    }

    private updateBattery(index: number, type: string, value: number) {
        if (!this.batteries.has(index)) {
            this.batteries.set(index, { soc: 0, capacity: 0 });
        }
        const battery = this.batteries.get(index)!;
        if (type === "soc") battery.soc = value;
        if (type === "capacity") battery.capacity = value;
    }

    private calculateWeightedSoc(): number {
        let totalWeightedSoc = 0;
        let totalCapacity = 0;

        this.batteries.forEach((battery: { soc: number; capacity: number; }) => {
            totalWeightedSoc += (battery.soc * battery.capacity);
            totalCapacity += battery.capacity;
        });

        const avgSoc = totalCapacity > 0 ? (totalWeightedSoc / totalCapacity) : 0;
        return Math.round(avgSoc);
    }

    private calculateSpeedKmH(): number {
        return this.speedMs * 3.6;
    }

    public getSnapshot() {
        return {
            car_id: this.id,
            time: new Date().toISOString(),
            state_of_charge: this.calculateWeightedSoc(),
            latitude: this.latitude,
            longitude: this.longitude,
            gear: this.gear,
            speed: this.calculateSpeedKmH()
        };
    }
}