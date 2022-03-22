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
export const AJUST_Y = 16;
export const AJUST_TILE_Y = 10;
export const AJUST_TILE_X = 5;
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
export const TILE_SIZE = 30;
export const BOARD_LENGTH = 15;
export const FOURTH_SQUARE = 4;
export const BOUNDS = BOARD_LENGTH / BOARD_LENGTH;
export const SQUARE_SIZE = DEFAULT_INNER_WIDTH / BOARD_LENGTH - BOUNDS;

export const DEFAULT_RESERVE = 88;

export const SEC_CONVERT = 60;

export const NORMAL_RACK_LENGTH = 7;

export const MISSING = -1;

export const IDS_KEY = 'ids';

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
    '-- Voici ce que vous pouvez faire: --\n' +
    '\n!placer <ligne><colonne>[(h|v)] <letters>\n' +
    'ex: !placer g10v abc placera les lettres\n' +
    'abc verticalement à partir de la position g10\n' +
    '\n!passer permet de passer votre tour\n' +
    '\n!échanger permet changer vos lettres\n' +
    'ex: !échanger abc\n' +
    '\n!réserve : afficher la quantité restante de chaque lettre dans la réserve\n' +
    '\n!indice : obtenir 3 choix de mots à placer\n' +
    '\n!aide : obtenir une explication des commandes disponibles\n' +
    '\n-- Voici ce que vous pouvez faire sur le chevalet et le plateau: --\n' +
    '\ncliquer sur une tuile pour la déplacer avec les flèches de votre clavier ou la roulette de votre souris' +
    '\nou taper sur la touche de votre clavier correspondant à la lettre pour la sélectionner\n' +
    '\nfaites un clic droit sur les tuiles pour sélectionner des lettres à échanger\n' +
    '\ncliquer sur une case du plateau pour placer des lettres de votre chevalet horizontalement\n' +
    'en tapant les touches correspondantes du clavier,\n' +
    'cliquer une seconde fois pour placer verticalement\n';

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
}
