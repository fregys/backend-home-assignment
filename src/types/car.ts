export interface CarSnapshot {
    car_id: number;
    time: string;
    state_of_charge: number;
    latitude: number;
    longitude: number;
    gear: number;
    speed: number;
}