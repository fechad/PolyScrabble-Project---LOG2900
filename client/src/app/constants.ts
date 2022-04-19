import { BehaviorSubject } from 'rxjs';
import { GameType } from './classes/parameters';
import { Room, State } from './classes/room';

export const DEFAULT_WIDTH = 525;
export const DEFAULT_HEIGHT = 525;
export const MAX_RACK_SIZE = 7;
export const LAST_INDEX = -1;
export const CANVAS_SQUARE_SIZE = 33;
export const PLAY_AREA_SIZE = 520;
export const ADJUSTMENT = 2;
export const POS_AND_SHIFT = 16;
export const BOARD_SIZE = 15;

export const DEFAULT_SIZE = 500;
export const OFFSET = 1;
export const TILE = 32;
export const NUMBER_OF_TILES = 15;
export const GRID_ORIGIN = 20;
export const CANVAS_ADJUSTMENT = 16;

export const DEFAULT_INNER_WIDTH = 500;
export const DEFAULT_INNER_HEIGHT = 500;
export const CENTER_TILE = 7;
export const HIGH_VALUE_TILE_SCORE = 10;
export const AJUST_Y = 16;
export const AJUST_TILE_Y = 10;
export const AJUST_TILE_X = 2.5;
export const ADJUST_SCORE_X = 25;
export const HIGH_VALUE_ADJUST = 20;
export const ADJUST_SCORE_Y = 10;
export const AJUST_STAR_X = 4;
export const AJUST_STAR_Y = 10;
export const AJUST_BONUS = 10;
export const AJUST_BONUS_WORD = 5;
export const AJUST_BONUS_LETTER = 1;
export const AJUST_LETTER = 4;
export const TWO_CHAR_NUMBER = 10;
export const AJUST_STEP = 0.5;
export const EXCEPTION_X = 11;
export const EXCEPTION_Y = 0;
export const AMOUNT_OF_NUMBER = 15;
export const INITIAL_SIZE = 9;
export const TILE_SIZE = 25;
export const SCORE_SIZE = 10;
export const BOARD_LENGTH = 15;
export const FOURTH_SQUARE = 4;
export const BOUNDS = BOARD_LENGTH / BOARD_LENGTH;
export const SQUARE_SIZE = DEFAULT_INNER_WIDTH / BOARD_LENGTH - BOUNDS;
export const RADIUS = 7.5;
export const Y_PLACEMENT = 16;
export const STEP_MESSAGE = 10;
export const STEP_HEADER = 33.5;
export const TRIPLE_WORD_POS = ['00', '07', '014', '70', '714', '147', '140', '1414'];
export const TRIPLE_LETTER_POS = ['15', '19', '51', '55', '59', '513', '91', '95', '99', '913', '135', '139'];
export const DOUBLE_WORD_POS = ['11', '22', '33', '44', '1010', '1111', '1212', '1313', '113', '212', '311', '410', '131', '122', '113', '104'];
export const DOUBLE_LETTER_POS = [
    '03',
    '011',
    '30',
    '314',
    '37',
    '26',
    '28',
    '62',
    '66',
    '68',
    '612',
    '73',
    '711',
    '82',
    '86',
    '88',
    '812',
    '117',
    '1114',
    '126',
    '128',
    '143',
    '1411',
];

export const DEFAULT_RESERVE = 88;

export const SEC_CONVERT = 60;
export const SEC_TO_MS = 1000;

export const NORMAL_RACK_LENGTH = 7;

export const MISSING = -1;

export const RENDERING_DELAY = 10;

export const COMMAND_INDEX = 0;
export const LETTERS_TO_EXCHANGE_INDEX = 1;
export const POSITION_BLOCK_INDEX = 1;
export const MIN_TYPED_WORD_LENGTH = 1;
export const HELP_COMMAND_LENGTH = 1;
export const PASS_COMMAND_LENGTH = 1;
export const RESERVE_COMMAND_LENGTH = 1;
export const POSITION_BLOCK_MIN_LENGTH = 2;
export const WORD_TO_PLACE_INDEX = 2;
export const EXCHANGE_COMMAND_LENGTH = 2;
export const HORIZONTAL_POSITION_2ND_DIGIT_INDEX = 2;
export const PLACE_COMMAND_LENGTH = 3;
export const POSITION_BLOCK_AVG_LENGTH = 3;
export const POSITION_BLOCK_MAX_LENGTH = 4;
export const MAX_TYPED_WORD_LENGTH = 7;
export const DECIMAL_BASE = 10;
export const HINT_COMMAND_LENGTH = 1;

export const HELP_MESSAGE: string =
    '-- Commandes disponibles: -- \n' +
    '\n!placer [ligne][colonne][(h|v)] [lettres] : Ajouter des lettres sur la grille en fonction de la ligne, de la colonne et du sens désiré. \n' +
    'exemple: !placer 9gh jeu\n' +
    '\n!échanger [lettre] : Échanger les lettres choisies par des nouvelles lettres durant votre tour.\n' +
    'exemple: !échanger abc\n' +
    '\n!passer : Passer votre tour.\n' +
    '\n!indice : Obtenir 3 choix de mots à placer.\n' +
    '\n!réserve : Afficher la quantité restante de chaque lettre dans la réserve (commande disponible en tout temps).\n' +
    '\n!aide ou bouton (?): Obtenir une explication des commandes du jeu (commande disponible en tout temps).\n' +
    '\n-- Manipulations du chevalet: --\n' +
    "\n1. Sélectionnez une tuile de votre chevalet soit à l'aide d'un clic gauche ou en tapant sur votre clavier la lettre de celle-ci.\n" +
    '2. Utilisez les flèches de votre clavier ou la roulette de votre souris pour déplacer la tuile sélectionnée.\n' +
    "\nPour échanger une ou plusieurs tuiles, faites un clic droit sur celles-ci, puis appuyez sur le bouton 'Échanger' qui apparait.\n" +
    '\n-- Manipulations du plateau: --\n' +
    '\n1. Cliquez sur une case du plateau pour placer des lettres de votre chevalet horizontalement \n' +
    'en tapant les touches correspondantes du clavier\n' +
    '(cliquez une seconde fois pour placer verticalement).\n' +
    "2. Appuyez sur la touche 'enter' ou sur le bouton vert à droite du chevalet pour envoyer le placement.\n" +
    '\n-- Utilisation des lettres blanches --\n' +
    '\nLes lettres blanches sont représentées par des * dans les tuiles du chevalet.\n' +
    'Pour faire un placement avec une lettre blanche: \n' +
    '\nMettez une lettre en majuscule dans la commande de placement pour représenter la lettre blanche.\n' +
    "exemple: !placer h7h dormiR Pour faire un échange d'une lettre blanche:\n" +
    "\nMettez directement le symbole * dans la commande d'échange ou faites un clic droit\n" +
    'sur la tuile du chevalet. exemple: !échanger ab*\n';

export const DEFAULT_FONT = '20px system-ui';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum Colors {
    Mustard = '#E1AC01',
    Yellow = '#FFE454',
    Green = '#54bd9d',
    Blue = '#65CCD2',
    Grey = '#838383',
    DarkGrey = '#575757',
    Black = '#000000',
    White = '#FFFFFF',
}

export const imgList: string[] = ['assets/icon-images/1.png', 'assets/icon-images/2.png', 'assets/icon-images/3.png', 'assets/icon-images/4.png'];
export const LAST_IMG = 3;
export const NUMBER_ICONS = 4;
export const MAX_NAME_CHARACTERS = 15;

export class CommunicationServiceMock {
    selectedRoom: BehaviorSubject<Room> = new BehaviorSubject({
        id: 0,
        name: 'Room',
        parameters: { avatar: 'a', timer: 60, dictionnary: 0, gameType: GameType.Multiplayer, log2990: false },
        mainPlayer: { avatar: 'a', name: 'Player 1', id: '0', connected: true },
        otherPlayer: undefined,
        state: State.Setup,
    } as Room);
    dictionnaries = Promise.resolve([{ id: 0, name: 'francais' }]);
    rooms: BehaviorSubject<Room[]> = new BehaviorSubject([] as Room[]);

    isWinner = false;

    start() {
        return;
    }

    kick() {
        return;
    }

    kickLeave() {
        return;
    }

    confirmForfeit() {
        return;
    }

    switchTurn(timerRequest: boolean) {
        return timerRequest;
    }

    saveScore() {
        return;
    }
    leave() {
        return;
    }
    getId(): number {
        return 1;
    }
    createRoom() {
        return;
    }
    async joinRoom() {
        return;
    }

    isServerDown() {
        return false;
    }
}
