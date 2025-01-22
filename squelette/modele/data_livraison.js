import { APIsql, connexion } from "../modele/connexion.js";
class UneLivraison {
    constructor(idForfait = "", libForfait = "", mtForfait = "") {
        this._idForfait = idForfait;
        this.libForfait = libForfait;
        this.mtForfait = mtForfait;
    }
    get idForfait() { return this._idForfait; }
    set idForfait(value) { this._idForfait = value; }
    get libForfait() { return this._libForfait; }
    set libForfait(value) { this._libForfait = value; }
    get mtForfait() { return this._mtForfait; }
    set mtForfait(value) { this._mtForfait = value; }
    toArray() {
        const tableau = {
            'idforfait': this._idForfait, 'libforfait': this._libForfait,
            'mtforfait': this._mtForfait
        };
        return tableau;
    }
}
class LesLivraisons {
    constructor() {
    }
    load(result) {
        let livraisons = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const livraison = new UneLivraison(item['id_forfait'], item['lib_forfait'], item['mt_forfait']);
            livraisons[livraison.idForfait] = livraison;
        }
        return livraisons;
    }
    prepare(where) {
        let sql;
        sql = "SELECT id_forfait, lib_forfait, mt_forfait ";
        sql += " FROM forfait_livraison, facture";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    all() {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    mtByNumfact(numFact) {
        const sql = "SELECT SUM(forfait_livraison.mt_forfait) AS total_mt " +
            "FROM forfait_livraison, facture " +
            "WHERE facture.id_forfait = forfait_livraison.id_forfait " +
            "AND facture.num_fact = ?";
        const result = APIsql.sqlWeb.SQLloadData(sql, [numFact]);
        if (result && result.length > 0 && result[0].total_mt) {
            return parseFloat(result[0].total_mt);
        }
        else {
            return 0;
        }
    }
    libForfaitByNumFact(numFact) {
        const sql = "SELECT lib_forfait " +
            "FROM forfait_livraison " +
            "INNER JOIN facture ON facture.id_forfait = forfait_livraison.id_forfait " +
            "WHERE facture.num_fact = ?";
        const result = APIsql.sqlWeb.SQLloadData(sql, [numFact]);
        if (result && result.length > 0 && result[0].lib_forfait) {
            return result[0].lib_forfait;
        }
        else {
            return "";
        }
    }
    toArray(livraisons) {
        let T = [];
        for (let id in livraisons) {
            T.push(livraisons[id].toArray());
        }
        return T;
    }
}
export { connexion };
export { UneLivraison };
export { LesLivraisons };
//# sourceMappingURL=data_livraison.js.map