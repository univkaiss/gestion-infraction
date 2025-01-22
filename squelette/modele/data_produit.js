import { APIsql, connexion } from "../modele/connexion.js";
class UnProduit {
    constructor(codeProd = "", libProd = "", type = "", origine = "", conditionnement = "", tarifHt = "") {
        this._codeProd = codeProd;
        this._libProd = libProd;
        this._type = type;
        this._origine = origine;
        this._conditionnement = conditionnement;
        this._tarifHt = tarifHt;
    }
    get codeProd() { return this._codeProd; }
    set codeProd(codeProd) { this._codeProd = codeProd; }
    get lib() { return this._libProd; }
    set lib(libProd) { this._libProd = libProd; }
    get type() { return this._type; }
    set type(type) { this._type = type; }
    get origine() { return this._origine; }
    set origine(origine) { this._origine = origine; }
    get conditionnement() { return this._conditionnement; }
    set conditionnement(conditionnement) { this._conditionnement = conditionnement; }
    get tarifHt() { return this._tarifHt; }
    set tarifHt(tarifHt) { this._tarifHt = tarifHt; }
    toArray() {
        let tableau = {
            "code_prod": this.codeProd,
            "lib_prod": this.lib,
            "type": this.type,
            "origine": this.origine,
            "conditionnement": this.conditionnement,
            "tarif_ht": this.tarifHt,
        };
        return tableau;
    }
}
class LesProduits {
    constructor() {
        // rien
    }
    load(result) {
        const produits = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const produit = new UnProduit(item["code_prod"], item["lib_prod"], item["type"], item["origine"], item["conditionnement"], item["tarif_ht"]);
            produits[produit.codeProd] = produit;
        }
        return produits;
    }
    byCodeProd(codeProd) {
        let produit = new UnProduit();
        const produits = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("code_prod = ?"), [codeProd]));
        const lesCles = Object.keys(produits);
        if (lesCles.length > 0) {
            produit = produits[lesCles[0]];
        }
        return produit;
    }
    prepare(where) {
        let sql;
        sql =
            "SELECT code_prod, lib_prod, type, origine, conditionnement, tarif_ht FROM produit ";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    all() {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    toArray(produits) {
        let T = [];
        for (let id in produits) {
            T.push(produits[id].toArray());
        }
        return T;
    }
    totalByNumFact(numFact) {
        const sql = "SELECT SUM(produit.tarif_ht * ligne.qte_prod) AS total " +
            "FROM produit, ligne, facture " +
            "WHERE produit.code_prod = ligne.code_prod " +
            "AND facture.num_fact = ligne.num_fact " +
            "AND facture.num_fact = ?";
        const result = APIsql.sqlWeb.SQLloadData(sql, [numFact]);
        if (result && result.length > 0 && result[0].total) {
            return parseFloat(result[0].total);
        }
        else {
            return 0;
        }
    }
}
class UnProduitByFacture {
    constructor(unProduit = null, qte = "") {
        this._unProduit = unProduit;
        this._qte = qte;
    }
    get qte() { return this._qte; }
    set qte(qte) { this._qte = qte; }
    get unProduit() { return this._unProduit; }
    set unProduit(unProduit) { this._unProduit = unProduit; }
    toArray() {
        let tableau = this.unProduit.toArray();
        tableau["qte"] = this.qte;
        return tableau;
    }
}
class LesProduitsByFacture {
    constructor() {
    }
    load(result) {
        const produitsByFacture = {};
        const lesProduits = new LesProduits();
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const produit = lesProduits.byCodeProd(item["code_prod"]);
            const produitByFacture = new UnProduitByFacture(produit, item["qte"]);
            produitsByFacture[produitByFacture.unProduit.codeProd] = produitByFacture;
        }
        return produitsByFacture;
    }
    prepare(where) {
        let sql;
        sql = "SELECT code_prod, qte FROM ligne";
        if (where.trim() !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    byNumFact(numFact) {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ?"), [numFact]));
    }
    byNumFactCodeProd(numFact, codeProd) {
        let produitByFacture = new UnProduitByFacture();
        let produitsByFacture = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("num_fact = ? and code_prod = ?"), [numFact, codeProd]));
        if (produitsByFacture[0] === undefined) {
            produitByFacture = produitsByFacture[0];
        }
        return produitByFacture;
    }
    toArray(produitsByFacture) {
        let T = [];
        for (let id in produitsByFacture) {
            T.push(produitsByFacture[id].toArray());
            delete T[T.length - 1].qte;
        }
        return T;
    }
    getTotalQte(produitsByFacture) {
        let total = 0;
        for (let id in produitsByFacture) {
            total += parseInt(produitsByFacture[id].qte);
        }
        return total.toString();
    }
    getTotaltarifHt(produitsByFacture) {
        let total = 0;
        for (let id in produitsByFacture) {
            const tarifHt = parseFloat(produitsByFacture[id].unProduit.tarifHt);
            if (!isNaN(tarifHt)) {
                total += tarifHt;
            }
        }
        return total.toString();
    }
    getNbProd(numFact) {
        const sql = "SELECT COUNT(num_fact)" +
            "FROM ligne" +
            "WHERE num_fact = ? ";
        const result = APIsql.sqlWeb.SQLloadData(sql, [numFact]);
        if (result && result.length > 0 && result[0].total) {
            return parseFloat(result[0].total);
        }
        else {
            return 0;
        }
    }
    delete(num_fact) {
        let sql;
        sql = "DELETE FROM ligne WHERE num_fact = ?";
        return APIsql.sqlWeb.SQLexec(sql, [num_fact]); // requête de manipulation : utiliser SQLexec
    }
}
export { connexion };
export { UnProduit };
export { LesProduits };
export { UnProduitByFacture };
export { LesProduitsByFacture };
//# sourceMappingURL=data_produit.js.map