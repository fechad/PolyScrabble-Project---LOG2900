import * as cst from '@app/controllers/db.controller';
import { DataBaseController, VP } from '@app/controllers/db.controller';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Collection } from 'mongodb';
import { Service } from 'typedi';

export type VpPair = { oldVp: VP; newVp: VP };

@Service()
export class VpNamesService {
    private vpCollection: Collection | undefined = undefined;
    constructor(private dataBase: DataBaseController) {
        this.vpCollection = this.dataBase.db?.collection(cst.VP_COLLECTION);
    }

    async getNames(): Promise<VP[]> {
        if (!this.vpCollection) return cst.DEFAULT_VPS;
        const vpNames = (await this.vpCollection.aggregate().project({ _id: 0 }).toArray()) as VP[];
        return vpNames;
    }

    async addVP(vp: VP, res: Response): Promise<void> {
        try {
            await this.vpCollection?.insertOne(vp);
            res.status(StatusCodes.OK).send('Succès: Joueur virtuel ajouté.');
        } catch (e) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Échec: Joueur virtuel non ajouté.');
        }
    }

    async updateVP(vps: VpPair) {
        await this.vpCollection?.findOneAndReplace({ name: { $eq: vps.oldVp.name } }, vps.newVp);
    }

    async deleteVP(name: string) {
        if (!this.vpCollection) return;
        await this.vpCollection.deleteOne({ name: { $eq: name } });
    }

    async deleteAll() {
        if (!this.vpCollection) return;
        await this.vpCollection.deleteMany({ default: { $eq: false } });
    }
}
