import { LesFactures } from "../modele/data_facture"
import { TUnProduitsByFacture, LesProduitsByFacture, LesProduits } from "../modele/data_produit"
import { LesLivraisons } from "../modele/data_livraison"
import { LesClients } from "../modele/data_client"

type TStatutValeur = 'correct' | 'vide' | 'inconnu' | 'doublon'
type TErreur = { statut: TStatutValeur, msg: { [key in TStatutValeur]: string } }
type TFactureEditForm = {
    divDetail: HTMLElement
    , divTitre: HTMLElement
    , edtNum: HTMLInputElement
    , edtCommentaire: HTMLInputElement
    , edtDate: HTMLInputElement
    , edtNumClient: HTMLInputElement
    , btnRetour: HTMLInputElement
    , btnValider: HTMLInputElement
    , btnAnnuler: HTMLInputElement
    , lblDetailClient: HTMLLabelElement
    , lblNumErreur: HTMLLabelElement
    , lblEdtDateErreur: HTMLLabelElement
    , lblEdtClientErreur: HTMLLabelElement
    , lblLivraisonErreur: HTMLLabelElement
    , lblProduitErreur: HTMLLabelElement
    , divFactureProduits: HTMLDivElement
    , divFactureProduitsEdit: HTMLDivElement
    , btnAjouterEquipt: HTMLInputElement
    , lblTotal: HTMLLabelElement
    , tableFactureProduits: HTMLTableElement
    , listeFactureProduits: HTMLSelectElement
    , edtQte: HTMLInputElement
    , btnValiderProduits: HTMLInputElement
    , btnAnnulerProduits: HTMLInputElement
    , lblSelectProduitsErreur: HTMLLabelElement
    , lblQteErreur: HTMLLabelElement
}

class VueFactureEdit {

    private _produitsAAjouter: { CodeProd: string, quantite: number, montant: number }[] = [];

    private _form: TFactureEditForm
    private _params: string[]; // paramètres reçus par le fichier HTML
    // tel que params[0] : mode affi, modif, suppr, ajout
    // params[1] : id en mode affi, modif, suppr
    private _grille: TUnProduitsByFacture; // tableau des équipements de la salle
    private _erreur: {
        // tableau contenant les messages d'erreur pour chaque type d'erreur pour chaque zone de saisie à vérifier
        [key: string]: TErreur
    }
    get form(): TFactureEditForm { return this._form }
    get params(): string[] { return this._params }
    get grille(): TUnProduitsByFacture { return this._grille }
    get erreur(): { [key: string]: TErreur } { return this._erreur }
    initMsgErreur(): void {
        // les erreurs "champ vide", "valeur inconnue", "doublon"
        //sont les trois principales erreurs dans un formulaire
        // pour chaque champ à contrôler (événement onChange),
        //création des 3 messages d'erreur + message pour correct
        // avec chaîne vide si pas d'erreur générée pour un type d'erreur potentielle
        this._erreur = {
            edtNum: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "Le numéro de facture doit être renseigné."
                    , inconnu: "Le numéro ne peut contenir que des lettres et des chiffres."
                    , doublon: "Le numéro de facture est déjà attribué."
                }
            }
            , edtDate: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "La date doit être renseigné."
                    , inconnu: ""
                    , doublon: ""
                }
            }
            , edtNumClient: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "Le client doit être renseigné."
                    , inconnu: "Client inconnu."
                    , doublon: ""
                }
            }
            , produits: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "LChoisir un équipement dans la liste"
                    , inconnu: ""
                    , doublon: ""
                }
            }
            , listeProduit: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "Aucun Produit choisi"
                    , inconnu: ""
                    , doublon: ""
                }
            }
            , edtQte: {
                statut: 'vide'
                , msg: {
                    correct: ""
                    , vide: "La quantité doit être un nombre entier supérieur à 0"
                    , inconnu: ""
                    , doublon: ""
                }
            }
        }
    }

    init(form: TFactureEditForm): void {
        this._form = form;
        this._params = location.search.substring(1).split('&');
        // params[0] : mode affi, modif, suppr, ajout
        // params[1] : id en mode affi, modif, suppr

        this.initMsgErreur();
        let titre: string;
        switch (this.params[0]) {
            case 'suppr': titre = "Suppression d'une Facture"; break;
            case 'ajout': titre = "Nouvelle facture"; break;
            case 'modif': titre = "Modification d'une facture"; break;
            default: titre = "Détail d'une facture";
        }

        if (this.params[0] === "suppr") {
            setTimeout(() => { this.supprimer(this.params[1]) }, 1000);
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
            this.form.edtNumClient.value = facture.id_cli
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
            (document.querySelector('[id=btn_produit_ajouter]') as HTMLElement).hidden = true;
            (document.querySelector('[id=edt_produit_qte]') as HTMLElement).parentElement.parentElement.hidden = true;
            (document.querySelector('[id=edt_facture_livraison]') as HTMLInputElement).value = lesLivraisons.libForfaitByNumFact(facture.numFact);
            (document.querySelector('[id=edt_facture_remise]') as HTMLInputElement).value = lesClients.byIdClient(facture.id_cli).tauxRemise;
            this.form.tableFactureProduits.hidden = true;
            this.form.btnAnnuler.hidden = true;
            this.form.btnValider.hidden = true;
            this.form.edtNum.readOnly = true;
            this.form.edtDate.readOnly = true;
            this.form.edtCommentaire.readOnly = true;
            this.form.edtNumClient.readOnly = true;
            (document.querySelector('[id=edt_facture_livraison]') as HTMLInputElement).readOnly = true;
            (document.querySelector('[id=edt_facture_remise]') as HTMLInputElement).readOnly = true;



            let tableProd = (document.querySelector('[id=table_produit]') as HTMLTableElement);
            const tbody = tableProd.getElementsByTagName('tbody')[0];

      
                var newRow = document.createElement('tr');
                var CodeCell = document.createElement('td');



                newRow.appendChild(CodeCell);
                var libCell = document.createElement('td');
                libCell.textContent = "Contenu de la cellule";
                newRow.appendChild(libCell);
                tbody.appendChild(newRow);
            


        }

        if (this.params[0] === 'ajout') {
            this.form.edtNum.value = String(lesFactures.getMaxNumFacture() + 1)
            this.form.edtDate.value = String(this.getDay()).split("-").reverse().join("/");
            let btnAjouter = (document.querySelector('[id=btn_produit_ajouter]') as HTMLButtonElement);
            const select = (document.querySelector('[id=select_produit]') as HTMLSelectElement)


            const numClientInput = (document.querySelector('[id=edt_facture_numclient]') as HTMLInputElement)
            numClientInput.addEventListener("change", () => {
                const pInfoClient = (document.querySelector('[id=clien_p]') as HTMLElement)

                const unClient = lesClients.byIdClient(numClientInput.value);

                pInfoClient.textContent = `${unClient.civCli} ${unClient.nomCli} ${unClient.prenomCli} 
                                           ${unClient.adresse} - ${unClient.codePostal} ${unClient.commune}
                                           ${unClient.mail}\n
                                           Taux de remise maximum accordé : ${unClient.tauxRemise}%`;

                let edtRemise = (document.querySelector('[id=edt_facture_remise]') as HTMLInputElement)
                edtRemise.value = unClient.tauxRemise


            });



            btnAjouter.addEventListener("click", () => {
                select.innerHTML = "";
                const allproduits = lesProduits.all();
                for (const key in allproduits) {
                    const produit = allproduits[key];


                    var option = document.createElement('option');
                    option.textContent = produit.lib
                    option.value = produit.codeProd;
                    select.appendChild(option)
                }
            });


            const btnvalider = document.querySelector('[id=btn_produit_valider]') as HTMLButtonElement

            btnvalider.addEventListener("click", () => {
                const quantite = document.querySelector('[id=edt_produit_qte]') as HTMLInputElement
                const quantiteValue = quantite.value;

                var currentOption = select.selectedOptions[0];

                const nomProduit = currentOption.textContent;
                const codeProd = currentOption.value;

                console.log(quantiteValue)
                console.log(nomProduit)
                console.log(codeProd)
                const unProduit = lesProduits.byCodeProd(codeProd);

                let tableProd = (document.querySelector('[id=table_produit]') as HTMLTableElement);
                const tbody = tableProd.getElementsByTagName('tbody')[0];
                var newRow = document.createElement('tr');

                newRow.insertCell().textContent = unProduit.codeProd
                newRow.insertCell().textContent = unProduit.lib;
                newRow.insertCell().textContent = unProduit.type;
                newRow.insertCell().textContent = unProduit.conditionnement;
                newRow.insertCell().textContent = unProduit.tarifHt;
                newRow.insertCell().textContent = quantiteValue;
                newRow.insertCell().textContent = String(Number(quantiteValue) * Number(unProduit.tarifHt));


                const balisea = document.createElement("a")
                balisea.classList.add('img_modification')
                newRow.insertCell().appendChild(balisea)

                const balisea2 = document.createElement("a")
                balisea2.classList.add('img_corbeille')
                newRow.insertCell().appendChild(balisea2)
                tbody.appendChild(newRow);

                const ProduitAAjouter = {
                    CodeProd: unProduit.codeProd,
                    quantite: Number(quantiteValue),
                    montant: Number(quantiteValue) * Number(unProduit.tarifHt)
                }
                this._produitsAAjouter.push(ProduitAAjouter);

                balisea.addEventListener("click", () => {
                    console.log("balisea")

                });

                balisea2.addEventListener("click", () => {
                    tbody.removeChild(newRow);
                    this._produitsAAjouter.splice(this._produitsAAjouter.indexOf(ProduitAAjouter), 1)
                    this.MAJlabelPrix();



                });

                this.MAJlabelPrix();
                var currentOption = select.selectedOptions[0];
                select.removeChild(currentOption);



            });


        }

    }

    MAJlabelPrix(): void {
        let label = (document.querySelector('[id=lbl_produit_total]') as HTMLTableElement);
        let TarifHT = 0;
        for (const produit of this._produitsAAjouter) {
            TarifHT += produit.montant;
        }

        const remise = Number((document.querySelector('[id=edt_facture_remise]') as HTMLInputElement).value);
        const remiseNumber = ((TarifHT * remise) / 100);
        label.textContent = "TarifHT : " + TarifHT + " - Remise : " + remiseNumber + " - A payer : " + (TarifHT - remiseNumber);



    }


    supprimer(numFacture: string): void {
        if (confirm("Confirmez-vous la suppression de la facture ")) {
            let lesProduitsByFacture: LesProduitsByFacture = new LesProduitsByFacture();
            lesProduitsByFacture.delete(numFacture);
            const lesFactures = new LesFactures;
            lesFactures.delete(numFacture);
        }

    }

    getDay(): string {
        const currentDate: Date = new Date();
        const year: number = currentDate.getFullYear();
        const month: number = currentDate.getMonth() + 1; // Les mois vont de 0 à 11, donc on ajoute 1
        const day: number = currentDate.getDate();

        // Formatage de la date avec des zéros ajoutés pour maintenir la longueur fixe
        const formattedMonth: string = month < 10 ? `0${month}` : `${month}`;
        const formattedDay: string = day < 10 ? `0${day}` : `${day}`;

        // Concaténation de l'année, du mois et du jour avec des tirets
        const formattedDate: string = `${year}-${formattedMonth}-${formattedDay}`;

        return formattedDate;
    }

    verifNum(valeur: string): void {
        const lesFactures = new LesFactures;
        const err = this.erreur.edtNum
        err.statut = "correct";
        const chaine: string = valeur.trim();
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
        else err.statut = 'vide';
    }

    verifClient(valeur: string): void {
        const err = this.erreur.edtNumClient
        err.statut = "correct";
        const chaine: string = valeur.trim();
        if (chaine.length === 0) {
            err.statut = 'vide';
        }
    }
    raiteErreur(uneErreur: TErreur, zone: HTMLElement): boolean {
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

    verifQte(): void {
        const err = this._erreur.edtQte
        err.statut = "correct";
        const valeur: string = this._form.edtQte.value;
        if (!((Number.isInteger(Number(valeur))) && (Number(valeur) > 0))) {
            err.statut = 'vide'
        }
    }
}





let vueFactureEdit = new VueFactureEdit;
export { vueFactureEdit }