import { LetterNode } from '@app/classes/letter-node';
import * as fs from 'fs';
import { promises } from 'fs';
import { Service } from 'typedi';

export type Dictionnary = { id: number; name: string; words: string[]; trie: LetterNode };
export type DictionnaryInfo = { id: number; name: string; words: string[] };
export type DialogDictionary = { id: number; name: string; description: string; words: string[]; trie: LetterNode };

@Service()
export class DictionnaryService {
    dictionnaries: DialogDictionary[] = [];

    static generateTrie(dictionnary: string[]): LetterNode {
        const trie = new LetterNode('*');
        for (const word of dictionnary) {
            let actualNode = trie;
            [...word].forEach((letter) => {
                actualNode = actualNode.addNext(letter.toUpperCase());
            });
            actualNode.terminal = true;
        }
        return trie;
    }

    async init() {
        if (this.dictionnaries.length !== 0) return;
        const fileBuffer = await promises.readFile('./assets/dictionnary.json');
        const readDictionary = JSON.parse(fileBuffer.toString());
        this.dictionnaries.push({
            id: 0,
            name: 'français',
            description: 'description de base',
            words: readDictionary.words,
            trie: DictionnaryService.generateTrie(readDictionary.words),
        });
    }

    async copyDictionaries() {
        const files = await fs.promises.readdir('./dictionaries/');
        for (const file of files) {
            const id = Number(file.split('-')[1][0]);
            if (id !== 0) {
                const fileBuffer = await promises.readFile(`./dictionaries/dictionary-${id}.json`);
                const readDictionary = JSON.parse(fileBuffer.toString());
                this.dictionnaries.push({
                    id,
                    name: readDictionary.title,
                    description: readDictionary.description,
                    words: readDictionary.words,
                    trie: DictionnaryService.generateTrie(readDictionary.words),
                });
            }
        }
    }

    getDictionnaries(): DialogDictionary[] {
        const dictionaryList = this.dictionnaries.map(
            (dict) => ({ id: dict.id, name: dict.name, description: dict.description } as DialogDictionary),
        );
        return dictionaryList;
    }

    isValidWord(id: number, playedWord: string) {
        if (!this.isWord(playedWord)) return false;
        return this.dictionnaries[id].words.includes(playedWord.toLowerCase());
    }

    validateWords(id: number, wordList: string[]): boolean {
        return wordList.map((word) => word.split(';')).every((words) => this.isValidWord(id, words[words.length - 1]));
    }

    private isWord(expression: string): boolean {
        return expression.match(/[a-z]+/i) !== null;
    }
}
