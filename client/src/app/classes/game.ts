import { CommunicationService } from '@app/services/communication.service';
import { SkipTurnService } from '@app/services/skip-turn.service';

export class Game {
    isMainPlayerTurn: boolean;
    private skipTurnService: SkipTurnService;
    private telephone: CommunicationService;
    constructor() {}

    skipTurn(playerID: string) {
        this.skipTurnService.skipTurn();
    }

    updateRack(playerID: string, letters: string) {}

    placeLetterOnBoard(letters: string, position: string, playerID: string, points: number) {
        //TODO: update la grille et le infoBox;
    }

    systemError(error: string) {
        this.telephone.sendLocalMessage(error);
    }

    receiveMessage(message: string, playerID: string) {}

    sendMessage(message: string) {
        this.telephone.sendMessage(message);
    }

    validateCommand(command: string[]): Error | undefined {
        if (command[0] === '!placer' && command.length === 3) return this.placer(command);
        if (command[0] === '!échanger' && command.length === 2) return this.echanger(command);
        if (command[0] === '!passer' && command.length === 1) return this.passer();

        return new Error(`La commande ${command[0]} n'existe pas`);
    }
    placer(command: string[]): Error | undefined {
        let error: Error | undefined;
        if (command[2].match(/[^a-zA-Z]/g)) {
            error = new Error("Un des caractère n'est pas valide, les caractères valides sont a-z et *");
        } else {
            // imbriquer si test chevalet est vrai
            /* TODO:checker si c dans le chevalet */
            if (command[1][0].match(/[a-o]/g) && command[1][command[1].length - 1].match(/[hv]/g)) {
                if (command[1].length === 3) {
                    if (command[1][1].match(/[0-9]/g)) {
                        console.log(command); // TODO: Envoyer commande
                    }
                    //
                } else if (command[1].length === 4 && command[1][1].match(/[1]/g) && command[1][2].match(/[0-4]/g)) {
                    console.log(command); // TODO: Envoyer commande
                }
            } else {
                error = new Error("Cette ligne n'existe pas ou l'orientation n'est pas valide");
            }
        }
        return error;
    }
    echanger(command: string[]): Error | undefined {
        let error: Error | undefined;
        if (command[1].match(/[^a-z*]/g)) {
            error = new Error("Un des caractère n'est pas valide, les caractères valides sont a-z et *");
        } else {
            console.log(command);
            /* TODO:checker si c dans le chevalet */
        }
        return error;
    }
    passer(): Error | undefined {
        this.skipTurnService.skipTurn();
        /* TODO: envoyer au serveur que le tour a été passé */
        return;
    }
}
