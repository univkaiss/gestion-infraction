import { connexion, APIsql } from "./connexion.js";
class UnClient {
    constructor(id_cli = "", civ_cli = "", nom_cli = "", prenom_cli = "", tel = "", mel = "", adr = "", cp = "", commune = "", tauxRemise = "") {
        this._idCli = id_cli;
        this._civCli = civ_cli;
        this._nomCli = nom_cli;
        this._prenomCli = prenom_cli;
        this._telCli = tel;
        this._melCli = mel;
        this._adrCli = adr;
        this._cpCli = cp;
        this._communeCli = commune;
        this._tauxmacRemiseCli = tauxRemise;
    }
    get idCli() { return this._idCli; }
    set idCli(idCli) { this._idCli = idCli; }
    get civCli() { return this._civCli; }
    set civCli(civCli) { this._civCli = civCli; }
    get nomCli() { return this._nomCli; }
    set nomCli(nomCli) { this._nomCli = nomCli; }
    get prenomCli() { return this._prenomCli; }
    set prenomCli(prenomCli) { this._prenomCli = prenomCli; }
    get tel() { return this._telCli; }
    set tel(tel) { this._telCli = tel; }
    get mail() { return this._melCli; }
    set mail(mail) { this._melCli = mail; }
    get adresse() { return this._adrCli; }
    set adresse(adresse) { this._adrCli = adresse; }
    get codePostal() { return this._cpCli; }
    set codePostal(codePostal) { this._cpCli = codePostal; }
    get commune() { return this._communeCli; }
    set commune(commune) { this._communeCli = commune; }
    get tauxRemise() { return this._tauxmacRemiseCli; }
    set tauxRemise(tauxRemise) { this._tauxmacRemiseCli = tauxRemise; }
    toArray() {
        let tableau = {
            'idCli': this.idCli, 'civCli': this.civCli,
            'nomCli': this.nomCli, 'prenomCli': this.prenomCli,
            'tel': this.tel, 'mel': this.mail,
            'adr': this.adresse, 'codePostal': this.codePostal,
            'commune': this.commune, 'tauxRemise': this.tauxRemise,
        };
        return tableau;
    }
}
class LesClients {
    constructor() {
    }
    load(result) {
        const depts = {};
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const client = new UnClient(item['id_cli'], item['civ_cli'], item['nom_cli'], item['prenom_cli'], item['tel_cli'], item['mel_cli'], item['adr_cli'], item['cp_cli'], item['commune_cli'], item['tauxmax_remise_cli']);
            depts[client.idCli] = client;
        }
        return depts;
    }
    prepare(where) {
        let sql;
        sql = "SELECT id_cli, civ_cli, nom_cli, prenom_cli, tel_cli, mel_cli, adr_cli, cp_cli, commune_cli, tauxmax_remise_cli ";
        sql += "FROM client";
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    all() {
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }
    byIdClient(id_cli) {
        let client = new UnClient;
        const clients = this.load(APIsql.sqlWeb.SQLloadData(this.prepare("id_cli = ?"), [id_cli]));
        const lesCles = Object.keys(clients);
        if (lesCles.length > 0) {
            client = clients[lesCles[0]];
        }
        return client;
    }
    toArray(clients) {
        let T = [];
        for (let id in clients) {
            T.push(clients[id].toArray());
        }
        return T;
    }
}
export { connexion };
export { UnClient };
export { LesClients };
//# sourceMappingURL=data_client.js.map