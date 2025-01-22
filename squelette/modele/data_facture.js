import { connexion, APIsql } from "../modele/connexion.js";
class UneFacture {
    constructor(num_fact = "", date_fact = "", commentaire = "", taux_remise = "", id_cli = "", id_forfait = "") {
        this._numfact = num_fact;
        this._date_fact = date_fact;
        this._comment_fact = commentaire;
        this._taux_remise = taux_remise;
        this._id_cli = id_cli;
        this._id_forfait = id_forfait;
    }
    get numFact() { return this._numfact; }
    ;
    set numFact(numFact) { this._numfact = numFact; }
    get dateFact() { return this._date_fact; }
    ;
    set dateFact(date_fact) { this._date_fact = date_fact; }
    get commentaire() { return this._comment_fact; }
    ;
    set commentaire(commentaire) { this._comment_fact = commentaire; }
    get taux_remise() { return this._taux_remise; }
    ;
    set taux_remise(taux_remise) { this._taux_remise = taux_remise; }
    get id_cli() { return this._id_cli; }
    ;
    set id_cli(id_cli) { this._id_cli = id_cli; }
    get id_forfait() { return this._id_forfait; }
    ;
    set id_forfait(id_forfait) { this._id_forfait = id_forfait; }
    toArray() {
        // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        const tableau = {
            'numFact': this._numfact, 'datefact': this._date_fact,
            'commentaire': this._comment_fact, 'taux_remise': this._taux_remise,
            'id_cli': this._id_cli, 'id_forfait': this._id_forfait
        };
        return tableau;
    }
}
class LesFactures {
    constructor() {
    }
    idExiste(num_fact) {
        return (APIsql.sqlWeb.SQLloadData("SELECT num_fact FROM facture WHERE num_fact=?", [num_fact]).length > 0);
    }
    load(result) {
        let factures = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const facture = new UneFacture(item['num_fact'], item['date_fact'], item['comment_fact'], item['taux_remise_fact'], item['id_cli'], item['if_forfait']);
            factures[facture.numFact] = facture; // clé d’un élément du tableau : num salle
        }
        return factures;
    }
    prepare(where) {
        let sql;
        sql = "SELECT num_fact, date_fact, comment_fact, taux_remise_fact, id_cli, id_forfait ";
        sql += " FROM facture";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    all() {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    byNumFacture(num_fact) {
        let facture = new UneFacture;
        const factures = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ?"), [num_fact]));
        const lesCles = Object.keys(factures);
        if (lesCles.length > 0) {
            facture = factures[lesCles[0]];
        }
        return facture;
    }
    toArray(factures) {
        let T = [];
        for (let id in factures) {
            T.push(factures[id].toArray());
        }
        return T;
    }
    getMaxNumFacture() {
        let sql = "SELECT MAX(num_fact) FROM facture";
        let result = APIsql.sqlWeb.SQLloadData(sql, []);
        const item = result[0];
        return parseInt(item["MAX(num_fact)"]);
    }
    delete(num_fact) {
        let sql;
        sql = "DELETE FROM facture WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [num_fact]);
    }
    insert(facture) {
        let sql;
        sql = "INSERT INTO facture(num_fact, date_fact, comment_fact, taux_remise_fact, id_cli, id_forfait) VALUES (?, ?, ?, ?, ?, ?)";
        return APIsql.sqlWeb.SQLexec(sql, [facture.numFact, facture.dateFact, facture.commentaire, facture.taux_remise, facture.id_cli, facture.id_forfait]);
    }
    update(facture) {
        let sql;
        sql = "UPDATE facture SET date_fact = ?, comment_fact = ?, taux_remise_fact = ?, id_cli = ?, id_forfait = ?, ";
        sql += " WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [facture.dateFact, facture.commentaire, facture.taux_remise, facture.id_cli, facture.id_forfait, facture.numFact]);
    }
}
export { connexion };
export { UneFacture };
export { LesFactures };
//# sourceMappingURL=data_facture.js.map