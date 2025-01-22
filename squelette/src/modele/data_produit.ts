import { APIsql, connexion } from "../modele/connexion.js";


class UnProduit {
  private _codeProd: string;
  private _libProd: string;
  private _type: string;
  private _origine: string;
  private _conditionnement: string;
  private _tarifHt: string;

  constructor(codeProd = "", libProd = "", type = "", origine = "", conditionnement = "", tarifHt = "",) {
    this._codeProd = codeProd;
    this._libProd = libProd;
    this._type = type;
    this._origine = origine;
    this._conditionnement = conditionnement;
    this._tarifHt = tarifHt;
  }
  get codeProd(): string {return this._codeProd;}
  set codeProd(codeProd: string) {this._codeProd = codeProd;}

  get lib(): string {return this._libProd;}
  set lib(libProd: string) {this._libProd = libProd;}

  get type(): string {return this._type;}
  set type(type: string) {this._type = type;}

  get origine(): string {return this._origine;}
  set origine(origine: string) {this._origine = origine;}

  get conditionnement(): string {return this._conditionnement;}
  set conditionnement(conditionnement: string) {this._conditionnement = conditionnement;}

  get tarifHt(): string {return this._tarifHt;}
  set tarifHt(tarifHt: string) {this._tarifHt = tarifHt;}

  toArray(): APIsql.TtabAsso {
    let tableau: APIsql.TtabAsso = {
    "code_prod": this.codeProd,
    "lib_prod": this.lib, 
    "type": this.type, 
    "origine": this.origine, 
    "conditionnement": this.conditionnement, 
    "tarif_ht": this.tarifHt,};
    return tableau;
  }
}

type TProduits = { [key: string]: UnProduit };

class LesProduits {
  constructor() {
    // rien
  }

  private load(result: APIsql.TdataSet): TProduits {
    const produits: TProduits = {};
    for (let i = 0; i < result.length; i++) {
      const item: APIsql.TtabAsso = result[i];
      const produit = new UnProduit( item["code_prod"], item["lib_prod"], item["type"], item["origine"], item["conditionnement"], item["tarif_ht"] );
      produits[produit.codeProd] = produit; 
    }
    return produits;
  }

  byCodeProd(codeProd: string): UnProduit {
    let produit = new UnProduit();
    const produits: TProduits = this.load(
      APIsql.sqlWeb.SQLloadData(this.prepare("code_prod = ?"), [codeProd]),
    );
    const lesCles: string[] = Object.keys(produits);
    if (lesCles.length > 0) {
      produit = produits[lesCles[0]];
    }
    return produit;
  }

  private prepare(where: string): string {
    let sql: string;
    sql =
      "SELECT code_prod, lib_prod, type, origine, conditionnement, tarif_ht FROM produit ";
    if (where !== "") {
      sql += " WHERE " + where;
    }
    return sql;
  }

  all(): TProduits {
    return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
  }

  toArray(produits: TProduits): APIsql.TdataSet {
    let T: APIsql.TdataSet = [];
    for (let id in produits) {
      T.push(produits[id].toArray());
    }
    return T;
  }

  totalByNumFact(numFact: string): number {
    const sql: string =
        "SELECT SUM(produit.tarif_ht * ligne.qte_prod) AS total " +
        "FROM produit, ligne, facture " +
        "WHERE produit.code_prod = ligne.code_prod " +
        "AND facture.num_fact = ligne.num_fact " +
        "AND facture.num_fact = ?";
    const result: APIsql.TdataSet = APIsql.sqlWeb.SQLloadData(sql, [numFact]);
    if (result && result.length > 0 && result[0].total) {
        return parseFloat(result[0].total);
    } else {
        return 0;
    }
}


}

class UnProduitByFacture {
  private _qte: string;
  private _unProduit: UnProduit;
  constructor(unProduit: UnProduit = null, qte = "") {
    this._unProduit = unProduit;
    this._qte = qte;
  }

  get qte() {return this._qte;}
  set qte(qte: string) {this._qte = qte;}

  get unProduit(): UnProduit {return this._unProduit;}
  set unProduit(unProduit: UnProduit) {this._unProduit = unProduit;}

  toArray(): APIsql.TtabAsso {
    let tableau = this.unProduit.toArray();
    tableau["qte"] = this.qte;
    return tableau;
  }
}

type TUnProduitsByFacture = { [key: string]: UnProduitByFacture };

class LesProduitsByFacture {
  constructor() {

  }

  private load(result: APIsql.TdataSet): TUnProduitsByFacture {
    const produitsByFacture: TUnProduitsByFacture = {};
    const lesProduits = new LesProduits();
    for (let i = 0; i < result.length; i++) {
      const item: APIsql.TtabAsso = result[i];
      const produit = lesProduits.byCodeProd(item["code_prod"]);
      const produitByFacture = new UnProduitByFacture(produit, item["qte"]);
      produitsByFacture[produitByFacture.unProduit.codeProd] = produitByFacture;
    }
    return produitsByFacture;
  }

  private prepare(where: string): string {
    let sql: string;
    sql = "SELECT code_prod, qte FROM ligne";
    if (where.trim() !== "") {
      sql += " WHERE " + where;
    }
    return sql;
  }

  byNumFact(numFact: string): TUnProduitsByFacture {
    return this.load(
      APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ?"), [numFact]),
    );
  }

  byNumFactCodeProd(numFact: string, codeProd: string): UnProduitByFacture {
    let produitByFacture = new UnProduitByFacture();
    let produitsByFacture: TUnProduitsByFacture = this.load(
      APIsql.sqlWeb.SQLloadData(
        this.prepare("num_fact = ? and code_prod = ?"),
        [numFact, codeProd],
      ),
    );
    if (produitsByFacture[0] === undefined) {
      produitByFacture = produitsByFacture[0];
    }
    return produitByFacture;
  }

  toArray(produitsByFacture: TUnProduitsByFacture): APIsql.TdataSet {
    let T: APIsql.TdataSet = [];
    for (let id in produitsByFacture) {
      T.push(produitsByFacture[id].toArray());
      delete T[T.length - 1].qte;
    }
    return T;
  }

  getTotalQte(produitsByFacture: TUnProduitsByFacture): string {
    let total = 0;
    for (let id in produitsByFacture) {
      total += parseInt(produitsByFacture[id].qte);
    }
    return total.toString();
  }

  getTotaltarifHt(produitsByFacture: TUnProduitsByFacture): string {
    let total = 0;
    for (let id in produitsByFacture) {
      const tarifHt = parseFloat(produitsByFacture[id].unProduit.tarifHt);
      if (!isNaN(tarifHt)) {
        total += tarifHt;
      }
    }
    return total.toString();
  }



  getMaxNumFacture():number{
    let sql:string = "SELECT COUNT(num_fact) FROM ligne WHERE num_fact = ?";
    let result = APIsql.sqlWeb.SQLloadData(sql, []);
    const item: APIsql.TtabAsso = result[0];
    return  parseInt(item["COUNT(num_fact)"]);
    
}

  delete(num_fact: string): boolean { // requête de suppression des équipements d’une salle dans «contient»
        let sql: string;
        sql = "DELETE FROM ligne WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [num_fact]); // requête de manipulation : utiliser SQLexec
    }
}

export { connexion };
export { UnProduit };
export { LesProduits };
export { TProduits };
export { UnProduitByFacture };
export { TUnProduitsByFacture };
export { LesProduitsByFacture };
