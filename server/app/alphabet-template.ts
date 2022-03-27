export type LetterInfo = {
    score: number;
    quantity: number;
};

/* eslint-disable @typescript-eslint/naming-convention, prettier/prettier */
export const ALPHABET: { [letter: string]: LetterInfo } = {
    'A': { score: 1, quantity: 9 },
    'B': { score: 3, quantity: 2 },
    'C': { score: 3, quantity: 2 },
    'D': { score: 2, quantity: 3 },
    'E': { score: 1, quantity: 15 },
    'F': { score: 4, quantity: 2 },
    'G': { score: 2, quantity: 2 },
    'H': { score: 4, quantity: 2 },
    'I': { score: 1, quantity: 8 },
    'J': { score: 8, quantity: 1 },
    'K': { score: 10, quantity: 1 },
    'L': { score: 1, quantity: 5 },
    'M': { score: 2, quantity: 3 },
    'N': { score: 1, quantity: 6 },
    'O': { score: 1, quantity: 6 },
    'P': { score: 3, quantity: 2 },
    'Q': { score: 8, quantity: 1 },
    'R': { score: 1, quantity: 6 },
    'S': { score: 1, quantity: 6 },
    'T': { score: 1, quantity: 6 },
    'U': { score: 1, quantity: 6 },
    'V': { score: 4, quantity: 2 },
    'W': { score: 10, quantity: 1 },
    'X': { score: 10, quantity: 1 },
    'Y': { score: 10, quantity: 1 },
    'Z': { score: 10, quantity: 1 },
    '*': { score: 0, quantity: 2 },
};
