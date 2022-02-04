import { PlayerId } from './room';

export interface Message {
    emitter: PlayerId;
    text: string;
}
