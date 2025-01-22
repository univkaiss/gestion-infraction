import { APIsql, connexion } from "../modele/connexion.js";

class UneLivraison {
  private _idForfait: string;
  private _libForfait: string;
  private _mtForfait: string;

  constructor(idForfait = "", libForfait = "", mtForfait = "") {
    this._idForfait = idForfait;
    this.libForfait = libForfait;
    this.mtForfait = mtForfait;
  }
  get idForfait(): string {return this._idForfait;}
  set idForfait(value: string) {this._idForfait = value; }

  get libForfait(): string {return this._libForfait;}
  set libForfait(value: string) {this._libForfait = value; }

  get mtForfait(): string {return this._mtForfait;}
  set mtForfait(value: string) {this._mtForfait = value; }

  toArray(): APIsql.TtabAsso {
    const tableau: APIsql.TtabAsso = {
        'idforfait': this._idForfait, 'libforfait': this._libForfait
        , 'mtforfait': this._mtForfait
    };
    return tableau;
    }
}

type TLivraison = { [key: string]: UneLivraison };

class LesLivraisons {
    constructor() {
    }
    private load(result: APIsql.TdataSet): TLivraison{
        let livraisons: TLivraison = {};
        for (let i = 0; i < result.length; i++) {
            const item: APIsql.TtabAsso = result[i];
            const livraison = new UneLivraison(item['id_forfait'], item['lib_forfait'], item['mt_forfait']);
            livraisons[livraison.idForfait] = livraison; 
        }
        return livraisons;
    }

    private prepare(where: string): string { 
        let sql: string;
        sql = "SELECT id_forfait, lib_forfait, mt_forfait ";
        sql += " FROM forfait_livraison, facture";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }

    all(): TLivraison {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }

    mtByNumfact(numFact: string): number {
        const sql: string =
            "SELECT SUM(forfait_livraison.mt_forfait) AS total_mt " +
            "FROM forfait_livraison, facture " +
            "WHERE facture.id_forfait = forfait_livraison.id_forfait " +
            "AND facture.num_fact = ?";
        const result: APIsql.TdataSet = APIsql.sqlWeb.SQLloadData(sql, [numFact]);
        if (result && result.length > 0 && result[0].total_mt) {
            return parseFloat(result[0].total_mt);
        } else {
            return 0; 
        }
    }


  
    libForfaitByNumFact(numFact: string): string {
        const sql: string =
            "SELECT lib_forfait " +
            "FROM forfait_livraison " +
            "INNER JOIN facture ON facture.id_forfait = forfait_livraison.id_forfait " +
            "WHERE facture.num_fact = ?";
        const result: APIsql.TdataSet = APIsql.sqlWeb.SQLloadData(sql, [numFact]);
        if (result && result.length > 0 && result[0].lib_forfait) {
            return result[0].lib_forfait; 
        } else {
            return ""; 
        }
    }
    
 
    toArray(livraisons: TLivraison): APIsql.TdataSet {
      let T: APIsql.TdataSet = [];
      for (let id in livraisons) {
          T.push(livraisons[id].toArray());
      }
      return T;
  }

   
}
export { connexion }
export { UneLivraison }
export { LesLivraisons }
export { TLivraison }


