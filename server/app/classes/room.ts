import { Connection } from './connection';
import { Parameters } from "./parameters";

type Player = {connection: Connection, name: string};
type Function = () => void; 

export class Room {

    private parameters : Parameters;
    readonly name : string;
    private mainPlayer : Player;
    private otherPlayer : Player | undefined;
    private deleteFunction : Function;

    
    constructor(playerSocket: Connection, playerName: string, deleteFunction: Function){
        this.parameters = new Parameters();
        this.mainPlayer = {
            connection: playerSocket,
            name: playerName
        };
        this.name = `partie de ${playerName}`
        this.deleteFunction = deleteFunction;
    }

    getParameters(): Parameters{
        return this.parameters;
    }

    changeParameter(parameters: Parameters, playerSocket: Connection){
        if(playerSocket != this.mainPlayer.connection){
            return Error("You're not allowed to change the parameters");
        }
        let error = parameters.validateParameters();
        if (error === undefined) {
            this.parameters = parameters;
        }
        return error;
    }

    addPlayer(playerSocket: Connection, playerName: string): Error | undefined{
        if (playerName == this.mainPlayer.name) {
            return Error("this name is already taken");
        } else {
            this.otherPlayer = { connection: playerSocket, name: playerName };
        }
        return;
    }

    removePlayer(playerSocket: Connection): Error | undefined{
        if(this.otherPlayer && playerSocket == this.otherPlayer.connection){
            this.otherPlayer = undefined;
        } else if(this.mainPlayer.connection == playerSocket){
            this.deleteFunction();
        }
        return Error("player not found");
    }
}