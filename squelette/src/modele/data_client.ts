import { connexion, APIsql } from "./connexion.js"
class UnClient { 
    private _idCli:string;
    private _civCli:string;
    private _nomCli:string;
    private _prenomCli:string;
    private _telCli:string;
    private _melCli:string;
    private _adrCli:string;
    private _cpCli:string;
    private _communeCli:string;
    private _tauxmacRemiseCli:string;
    constructor(id_cli ="", civ_cli="", nom_cli="", prenom_cli="", tel="", mel="", adr="",cp="",commune="", tauxRemise=""){
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
    get idCli(): string { return this._idCli; }
    set idCli(idCli: string) { this._idCli = idCli; }

    get civCli():string { return this._civCli}
    set civCli(civCli:string) {this._civCli = civCli}

    get nomCli():string { return this._nomCli}
    set nomCli(nomCli:string) {this._nomCli = nomCli}

    get prenomCli():string { return this._prenomCli}
    set prenomCli(prenomCli:string) {this._prenomCli = prenomCli}

    get tel():string { return this._telCli}
    set tel(tel:string) {this._telCli = tel}

    get mail():string { return this._melCli}
    set mail(mail:string) {this._melCli = mail}

    get adresse():string { return this._adrCli}
    set adresse(adresse:string) {this._adrCli = adresse}

    get codePostal():string { return this._cpCli}
    set codePostal(codePostal:string) {this._cpCli = codePostal}

    get commune():string { return this._communeCli}
    set commune(commune:string) {this._communeCli = commune}

    get tauxRemise():string { return this._tauxmacRemiseCli}
    set tauxRemise(tauxRemise:string) {this._tauxmacRemiseCli = tauxRemise}
    toArray(): APIsql.TtabAsso { 
        let tableau: APIsql.TtabAsso = {
            'idCli': this.idCli, 'civCli': this.civCli
            ,'nomCli': this.nomCli, 'prenomCli': this.prenomCli
            ,'tel': this.tel, 'mel': this.mail
            ,'adr': this.adresse, 'codePostal': this.codePostal
            ,'commune': this.commune, 'tauxRemise': this.tauxRemise,
        };
        return tableau;
    }
}

type TClients = { [key: string]: UnClient }; 

class LesClients{
    constructor(){
    }
    private load(result: APIsql.TdataSet): TClients {
        const depts: TClients = {};
        for (let i = 0; i < result.length; i++) {
            const item: APIsql.TtabAsso = result[i];
            const client = new UnClient(item['id_cli'], item['civ_cli'], item['nom_cli'], item['prenom_cli'], item['tel_cli'], item['mel_cli'], item['adr_cli'], item['cp_cli'], item['commune_cli'], item['tauxmax_remise_cli']);
            depts[client.idCli] = client;
        }
        return depts;
    }
    private prepare(where: string): string { 
        let sql: string;
        sql = "SELECT id_cli, civ_cli, nom_cli, prenom_cli, tel_cli, mel_cli, adr_cli, cp_cli, commune_cli, tauxmax_remise_cli ";
        sql += "FROM client"
        if (where !== "") {
            sql += " WHERE " + where;
        }
        return sql;
    }
    all(): TClients { 
        return this.load(APIsql.sqlWeb.SQLloadData(this.prepare(""), []));
    }

    byIdClient(id_cli: string): UnClient { 
        let client = new UnClient;
        const clients: TClients =
            this.load(APIsql.sqlWeb.SQLloadData(this.prepare("id_cli = ?"), [id_cli]));
        const lesCles: string[] = Object.keys(clients);
      
        if (lesCles.length > 0) {
            client = clients[lesCles[0]]; 
        }
        return client;
    }
    
    toArray(clients: TClients): APIsql.TdataSet {
        let T: APIsql.TdataSet = [];
        for (let id in clients) {
            T.push(clients[id].toArray());
        }
        return T;
    }
}
export { connexion }
export { UnClient }
export { LesClients }
export { TClients }