import { UneFacture, LesFactures } from "../modele/data_facture"
import { LesClients } from "../modele/data_client"
import { LesLivraisons } from "../modele/data_livraison"
import { LesProduits } from "../modele/data_produit"

type TFactureListeForm = {
    divTitre: HTMLElement, btnAjouter: HTMLInputElement, tableFacture: HTMLTableElement
}

class VueFactureListe {
    private _form: TFactureListeForm;
    get form(): TFactureListeForm { return this._form }
    init(form: TFactureListeForm): void {
        this._form = form;
        const lesFactures = new LesFactures();
        const lesClients = new LesClients();
        const lesProduits = new LesProduits();
        const lesLivraisons = new LesLivraisons();
        const data = lesFactures.all();
        this.form.divTitre.textContent = 'Liste des Factures';
        for (let num in data) {
            const uneFacture: UneFacture = data[num];
            const tr = this.form.tableFacture.insertRow();
            let balisea: HTMLAnchorElement;
            balisea = document.createElement("a")
            balisea.classList.add('img_visu') 
            balisea.onclick = function (): void { vueFactureListe.detailFactureClick(uneFacture.numFact); }
            tr.insertCell().appendChild(balisea) 
            tr.insertCell().textContent = uneFacture.numFact;
            tr.insertCell().textContent = uneFacture.dateFact.split("-").reverse().join("/");
            tr.insertCell().textContent = uneFacture.id_cli;
            tr.insertCell().textContent = lesClients.byIdClient(uneFacture.id_cli).nomCli;
            tr.insertCell().textContent = lesClients.byIdClient(uneFacture.id_cli).commune;
            const total = lesProduits.totalByNumFact(uneFacture.numFact);
            tr.insertCell().textContent = total.toFixed(2) + " €";

            const bon: number = parseFloat(lesClients.byIdClient(uneFacture.id_cli).tauxRemise);
            const jour = lesProduits.totalByNumFact(uneFacture.numFact);
            const totalRemise = (jour * (1 - bon / 100)).toFixed(2);
            tr.insertCell().textContent = totalRemise + " €";

            const montant = lesLivraisons.mtByNumfact(uneFacture.numFact);
            tr.insertCell().textContent = montant.toFixed(2) + " €";

            balisea = document.createElement("a")
            balisea.classList.add('img_modification') // définition class contenant l’image (voir css)
            balisea.onclick = function (): void { vueFactureListe.modifierFactureClick(uneFacture.numFact); }
            tr.insertCell().appendChild(balisea)
            // // création balise <a> pour appel page suppression d'une salle
            balisea = document.createElement("a")
            balisea.classList.add('img_corbeille') // définition class contenant l’image (voir css)
            balisea.onclick = function (): void { vueFactureListe.supprimerFactureClick(uneFacture.numFact); }
            tr.insertCell().appendChild(balisea)

        }
        this.form.btnAjouter.onclick = function (): void { vueFactureListe.ajouterFactureClick(); }
    }
    detailFactureClick(num: string): void {
        location.href = "facture_edit.html?affi&" + encodeURIComponent(num);
    }
    modifierFactureClick(num: string): void {
        location.href = "facture_edit.html?modif&" + encodeURIComponent(num)
    }
    supprimerFactureClick(num: string): void {
        location.href = "facture_edit.html?suppr&" + encodeURIComponent(num)
    }
    ajouterFactureClick(): void {
        location.href = "facture_edit.html?ajout"
    }
}
let vueFactureListe = new VueFactureListe;
export { vueFactureListe }