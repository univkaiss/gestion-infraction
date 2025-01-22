import { LesFactures } from "../modele/data_facture";
import { LesProduitsByFacture, LesProduits } from "../modele/data_produit";
import { LesLivraisons } from "../modele/data_livraison";
import { LesClients } from "../modele/data_client";
class VueFactureEdit {
    constructor() {
        this._produitsAAjouter = [];
    }
    get form() { return this._form; }
    get params() { return this._params; }
    get grille() { return this._grille; }
    get erreur() { return this._erreur; }
    initMsgErreur() {
        // les erreurs "champ vide", "valeur inconnue", "doublon"
        //sont les trois principales erreurs dans un formulaire
        // pour chaque champ à contrôler (événement onChange),
        //création des 3 messages d'erreur + message pour correct
        // avec chaîne vide si pas d'erreur générée pour un type d'erreur potentielle
        this._erreur = {
            edtNum: {
                statut: 'vide',
                msg: {
                    correct: "",
                    vide: "Le numéro de facture doit être renseigné.",
                    inconnu: "Le numéro ne peut contenir que des lettres et des chiffres.",
                    doublon: "Le numéro de facture est déjà attribué."
                }
            },
            edtDate: {
                statut: 'vide',
                msg: {
                    correct: "",
                    vide: "La date doit être renseigné.",
                    inconnu: "",
                    doublon: ""
                }
            },
            edtNumClient: {
                statut: 'vide',
                msg: {
                    correct: "",
                    vide: "Le client doit être renseigné.",
                    inconnu: "Client inconnu.",
                    doublon: ""
                }
            },
            produits: {
                statut: 'vide',
                msg: {
                    correct: "",
                    vide: "LChoisir un équipement dans la liste",
                    inconnu: "",
                    doublon: ""
                }
            },
            listeProduit: {
                statut: 'vide',
                msg: {
                    correct: "",
                    vide: "Aucun Produit choisi",
                    inconnu: "",
                    doublon: ""
                }
            },
            edtQte: {
                statut: 'vide',
                msg: {
                    correct: "",
                    vide: "La quantité doit être un nombre entier supérieur à 0",
                    inconnu: "",
                    doublon: ""
                }
            }
        };
    }
    init(form) {
        this._form = form;
        this._params = location.search.substring(1).split('&');
        // params[0] : mode affi, modif, suppr, ajout
        // params[1] : id en mode affi, modif, suppr
        this.initMsgErreur();
        let titre;
        switch (this.params[0]) {
            case 'suppr':
                titre = "Suppression d'une Facture";
                break;
            case 'ajout':
                titre = "Nouvelle facture";
                break;
            case 'modif':
                titre = "Modification d'une facture";
                break;
            default: titre = "Détail d'une facture";
        }
        if (this.params[0] === "suppr") {
            setTimeout(() => { this.supprimer(this.params[1]); }, 1000);
        }
        this.form.divTitre.textContent = titre;
        const lesFactures = new LesFactures;
        // this.afficheGrilleProduit();
        const affi = this.params[0] === 'affi';
        if (this.params[0] !== 'ajout') { // affi ou modif ou suppr
            const facture = lesFactures.byNumFacture(this._params[1]);
            this.form.edtNum.value = facture.numFact;
            this.form.edtCommentaire.value = facture.commentaire;
            this.form.edtDate.value = facture.dateFact;
            this.form.edtNumClient.value = facture.id_cli;
            this.form.edtNum.readOnly = true;
            this.form.edtCommentaire.readOnly = affi;
            this.form.edtDate.readOnly = affi;
            this.form.edtNumClient.readOnly = affi;
            this.erreur.edtNum.statut = "correct";
        }
        const lesLivraisons = new LesLivraisons();
        const facture = lesFactures.byNumFacture(this._params[1]);
        const lesClients = new LesClients();
        const lesProduits = new LesProduits();
        const lesProduitsByFacture = new LesProduitsByFacture();
        if (affi) {
            document.querySelector('[id=btn_produit_ajouter]').hidden = true;
            document.querySelector('[id=edt_produit_qte]').parentElement.parentElement.hidden = true;
            document.querySelector('[id=edt_facture_livraison]').value = lesLivraisons.libForfaitByNumFact(facture.numFact);
            document.querySelector('[id=edt_facture_remise]').value = lesClients.byIdClient(facture.id_cli).tauxRemise;
            this.form.tableFactureProduits.hidden = true;
            this.form.btnAnnuler.hidden = true;
            this.form.btnValider.hidden = true;
            this.form.edtNum.readOnly = true;
            this.form.edtDate.readOnly = true;
            this.form.edtCommentaire.readOnly = true;
            this.form.edtNumClient.readOnly = true;
            document.querySelector('[id=edt_facture_livraison]').readOnly = true;
            document.querySelector('[id=edt_facture_remise]').readOnly = true;
            let tableProd = document.querySelector('[id=table_produit]');
            const tbody = tableProd.getElementsByTagName('tbody')[0];
            for (let i = 0; i <= lesProduitsByFacture.getNbProd(facture.numFact); i++) {
                var newRow = document.createElement('tr');
                var CodeCell = document.createElement('td');
                console.log(lesProduitsByFacture.getNbProd(facture.numFact));
                newRow.appendChild(CodeCell);
                var libCell = document.createElement('td');
                libCell.textContent = "Contenu de la cellule";
                newRow.appendChild(libCell);
                tbody.appendChild(newRow);
            }
        }
        if (this.params[0] === 'ajout') {
            this.form.edtNum.value = String(lesFactures.getMaxNumFacture() + 1);
            this.form.edtDate.value = String(this.getDay()).split("-").reverse().join("/");
            let btnAjouter = document.querySelector('[id=btn_produit_ajouter]');
            const select = document.querySelector('[id=select_produit]');
            const numClientInput = document.querySelector('[id=edt_facture_numclient]');
            numClientInput.addEventListener("change", () => {
                const pInfoClient = document.querySelector('[id=clien_p]');
                const unClient = lesClients.byIdClient(numClientInput.value);
                pInfoClient.textContent = `${unClient.civCli} ${unClient.nomCli} ${unClient.prenomCli} 
                                           ${unClient.adresse} - ${unClient.codePostal} ${unClient.commune}
                                           ${unClient.mail}\n
                                           Taux de remise maximum accordé : ${unClient.tauxRemise}%`;
                let edtRemise = document.querySelector('[id=edt_facture_remise]');
                edtRemise.value = unClient.tauxRemise;
            });
            btnAjouter.addEventListener("click", () => {
                select.innerHTML = "";
                const allproduits = lesProduits.all();
                for (const key in allproduits) {
                    const produit = allproduits[key];
                    var option = document.createElement('option');
                    option.textContent = produit.lib;
                    option.value = produit.codeProd;
                    select.appendChild(option);
                }
            });
            const btnvalider = document.querySelector('[id=btn_produit_valider]');
            btnvalider.addEventListener("click", () => {
                const quantite = document.querySelector('[id=edt_produit_qte]');
                const quantiteValue = quantite.value;
                var currentOption = select.selectedOptions[0];
                const nomProduit = currentOption.textContent;
                const codeProd = currentOption.value;
                console.log(quantiteValue);
                console.log(nomProduit);
                console.log(codeProd);
                const unProduit = lesProduits.byCodeProd(codeProd);
                let tableProd = document.querySelector('[id=table_produit]');
                const tbody = tableProd.getElementsByTagName('tbody')[0];
                var newRow = document.createElement('tr');
                newRow.insertCell().textContent = unProduit.codeProd;
                newRow.insertCell().textContent = unProduit.lib;
                newRow.insertCell().textContent = unProduit.type;
                newRow.insertCell().textContent = unProduit.conditionnement;
                newRow.insertCell().textContent = unProduit.tarifHt;
                newRow.insertCell().textContent = quantiteValue;
                newRow.insertCell().textContent = String(Number(quantiteValue) * Number(unProduit.tarifHt));
                const balisea = document.createElement("a");
                balisea.classList.add('img_modification');
                newRow.insertCell().appendChild(balisea);
                const balisea2 = document.createElement("a");
                balisea2.classList.add('img_corbeille');
                newRow.insertCell().appendChild(balisea2);
                tbody.appendChild(newRow);
                const ProduitAAjouter = {
                    CodeProd: unProduit.codeProd,
                    quantite: Number(quantiteValue),
                    montant: Number(quantiteValue) * Number(unProduit.tarifHt)
                };
                this._produitsAAjouter.push(ProduitAAjouter);
                balisea.addEventListener("click", () => {
                    console.log("balisea");
                });
                balisea2.addEventListener("click", () => {
                    tbody.removeChild(newRow);
                    this._produitsAAjouter.splice(this._produitsAAjouter.indexOf(ProduitAAjouter), 1);
                    this.MAJlabelPrix();
                });
                this.MAJlabelPrix();
                var currentOption = select.selectedOptions[0];
                select.removeChild(currentOption);
            });
        }
    }
    MAJlabelPrix() {
        let label = document.querySelector('[id=lbl_produit_total]');
        let TarifHT = 0;
        for (const produit of this._produitsAAjouter) {
            TarifHT += produit.montant;
        }
        const remise = Number(document.querySelector('[id=edt_facture_remise]').value);
        const remiseNumber = ((TarifHT * remise) / 100);
        label.textContent = "TarifHT : " + TarifHT + " - Remise : " + remiseNumber + " - A payer : " + (TarifHT - remiseNumber);
    }
    supprimer(numFacture) {
        if (confirm("Confirmez-vous la suppression de la facture ")) {
            let lesProduitsByFacture = new LesProduitsByFacture();
            lesProduitsByFacture.delete(numFacture);
            const lesFactures = new LesFactures;
            lesFactures.delete(numFacture);
        }
    }
    getDay() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Les mois vont de 0 à 11, donc on ajoute 1
        const day = currentDate.getDate();
        // Formatage de la date avec des zéros ajoutés pour maintenir la longueur fixe
        const formattedMonth = month < 10 ? `0${month}` : `${month}`;
        const formattedDay = day < 10 ? `0${day}` : `${day}`;
        // Concaténation de l'année, du mois et du jour avec des tirets
        const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
        return formattedDate;
    }
    verifNum(valeur) {
        const lesFactures = new LesFactures;
        const err = this.erreur.edtNum;
        err.statut = "correct";
        const chaine = valeur.trim();
        if (chaine.length > 0) {
            if (!chaine.match(/^([a-zA-Z0-9]+)$/)) {
                // expression régulière qui teste si la chaîne ne contient rien d'autre
                // que des caractères alphabétiques minuscules ou majuscules et des chiffres
                this.erreur.edtNum.statut = 'inconnu';
            }
            else if ((this.params[0] === 'ajout') && (lesFactures.idExiste(chaine))) {
                this.erreur.edtNum.statut = 'doublon';
            }
        }
        else
            err.statut = 'vide';
    }
    verifClient(valeur) {
        const err = this.erreur.edtNumClient;
        err.statut = "correct";
        const chaine = valeur.trim();
        if (chaine.length === 0) {
            err.statut = 'vide';
        }
    }
    raiteErreur(uneErreur, zone) {
        let correct = true;
        zone.textContent = "";
        if (uneErreur.statut !== "correct") { // non correct ==> erreur
            if (uneErreur.msg[uneErreur.statut] !== '') { // erreur
                zone.textContent = uneErreur.msg[uneErreur.statut];
                correct = false;
            }
        }
        return correct;
    }
    verifQte() {
        const err = this._erreur.edtQte;
        err.statut = "correct";
        const valeur = this._form.edtQte.value;
        if (!((Number.isInteger(Number(valeur))) && (Number(valeur) > 0))) {
            err.statut = 'vide';
        }
    }
}
let vueFactureEdit = new VueFactureEdit;
export { vueFactureEdit };
//# sourceMappingURL=class_facture_edit.js.map