import { connexion, APIsql } from "../modele/connexion.js"
class UneFacture {
    private _numfact: string;
    private _date_fact: string;
    private _comment_fact: string;
    private _taux_remise: string;
    private _id_cli: string;
    private _id_forfait: string;
    constructor(num_fact = "", date_fact = "", commentaire = "", taux_remise = "", id_cli = "", id_forfait = "") {
        this._numfact = num_fact;
        this._date_fact = date_fact;
        this._comment_fact = commentaire;
        this._taux_remise = taux_remise;
        this._id_cli = id_cli;
        this._id_forfait = id_forfait;
    }
    get numFact(): string { return this._numfact };
    set numFact(numFact: string) { this._numfact = numFact }

    get dateFact(): string { return this._date_fact };
    set dateFact(date_fact: string) { this._date_fact = date_fact }

    get commentaire(): string { return this._comment_fact };
    set commentaire(commentaire: string) { this._comment_fact = commentaire }

    get taux_remise(): string { return this._taux_remise };
    set taux_remise(taux_remise: string) { this._taux_remise = taux_remise }

    get id_cli(): string { return this._id_cli };
    set id_cli(id_cli: string) { this._id_cli = id_cli }

    get id_forfait(): string { return this._id_forfait };
    set id_forfait(id_forfait: string) { this._id_forfait = id_forfait }
    
    toArray(): APIsql.TtabAsso {
        // renvoie l’objet sous la forme d’un tableau associatif
        // pour un affichage dans une ligne d’un tableau HTML
        const tableau: APIsql.TtabAsso = {
            'numFact': this._numfact, 'datefact': this._date_fact
            , 'commentaire': this._comment_fact, 'taux_remise': this._taux_remise
            , 'id_cli': this._id_cli, 'id_forfait': this._id_forfait
        };
        return tableau;
    }

}
type TFacture = { [key: string]: UneFacture };


class LesFactures {
    constructor() {
    }
    idExiste(num_fact: string): boolean {
        return (APIsql.sqlWeb.SQLloadData("SELECT num_fact FROM facture WHERE num_fact=?"
            , [num_fact]).length > 0);
    }
    private load(result: APIsql.TdataSet): TFacture {
        let factures: TFacture = {};
        for (let i = 0; i < result.length; i++) {
            const item: APIsql.TtabAsso = result[i];
            const facture = new UneFacture(item['num_fact'], item['date_fact'], item['comment_fact'], item['taux_remise_fact'], item['id_cli'], item['if_forfait']);
            factures[facture.numFact] = facture; // clé d’un élément du tableau : num salle
        }
        return factures;
    }
    private prepare(where: string): string { // préparation de la requête avec ou sans restriction (WHERE)
        let sql: string;
        sql = "SELECT num_fact, date_fact, comment_fact, taux_remise_fact, id_cli, id_forfait ";
        sql += " FROM facture";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }

    all(): TFacture {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    byNumFacture(num_fact: string): UneFacture {
        let facture = new UneFacture;
        const factures: TFacture = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ?")
            , [num_fact]));
        const lesCles: string[] = Object.keys(factures);

        if (lesCles.length > 0) {
            facture = factures[lesCles[0]];
        }
        return facture;
    }
    toArray(factures: TFacture): APIsql.TdataSet {
        let T: APIsql.TdataSet = [];
        for (let id in factures) {
            T.push(factures[id].toArray());
        }
        return T;
    }


    getMaxNumFacture():number{
        let sql:string = "SELECT MAX(num_fact) FROM facture";
        let result = APIsql.sqlWeb.SQLloadData(sql, []);
        const item: APIsql.TtabAsso = result[0];
        return  parseInt(item["MAX(num_fact)"]);
        
    }
    


    delete(num_fact: string): boolean {
        let sql: string;
        sql = "DELETE FROM facture WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [num_fact]); 
    }
    insert(facture: UneFacture): boolean { 
        let sql: string; 
        sql = "INSERT INTO facture(num_fact, date_fact, comment_fact, taux_remise_fact, id_cli, id_forfait) VALUES (?, ?, ?, ?, ?, ?)";
        return APIsql.sqlWeb.SQLexec(sql,[facture.numFact, facture.dateFact, facture.commentaire, facture.taux_remise, facture.id_cli, facture.id_forfait]);
    }
    update(facture: UneFacture): boolean { // requête de modification d’une salle dans la table
        let sql: string;
        sql = "UPDATE facture SET date_fact = ?, comment_fact = ?, taux_remise_fact = ?, id_cli = ?, id_forfait = ?, ";
        sql += " WHERE num_fact = ?"; 
        return APIsql.sqlWeb.SQLexec(sql, [facture.dateFact, facture.commentaire, facture.taux_remise, facture.id_cli, facture.id_forfait, facture.numFact ]);
    }
}
export { connexion }
export { UneFacture }
export { LesFactures }
export { TFacture }