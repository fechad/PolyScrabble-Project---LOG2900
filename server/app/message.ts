import { PlayerId } from './classes/room';

export interface Message {
    emitter: PlayerId;
    text: string;
}
