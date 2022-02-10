import { Room } from '@app/classes/room';
import { Service } from 'typedi';

@Service()
export class RoomsService {
    readonly rooms: Room[] = [];
}
