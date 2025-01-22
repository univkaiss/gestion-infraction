import { vueFactureEdit } from "./class_facture_edit.js";
vueFactureEdit.init({
    divDetail: document.querySelector('[id=div_facture_detail]'),
    edtNum: document.querySelector('[id=edt_facture_num]'),
    divTitre: document.querySelector('[id=div_facture_titre]'),
    edtCommentaire: document.querySelector('[id=edt_facture_com]'),
    edtDate: document.querySelector('[id=edt_facture_date]'),
    edtNumClient: document.querySelector('[id=edt_facture_numclient]'),
    btnRetour: document.querySelector('[id=btn_facture_retour]'),
    btnValider: document.querySelector('[id=btn_facture_valider]'),
    btnAnnuler: document.querySelector('[id=btn_facture_annuler]'),
    lblDetailClient: document.querySelector('[id=lbl_facture_detail_numclient]'),
    lblNumErreur: document.querySelector('[id=lbl_erreur_num]'),
    lblEdtDateErreur: document.querySelector('[id=lbl_erreur_date]'),
    lblEdtClientErreur: document.querySelector('[id=lbl_erreur_client]'),
    lblLivraisonErreur: document.querySelector('[id=lbl_erreur_livraison]'),
    lblProduitErreur: document.querySelector('[id=div_salle_produit]'),
    divFactureProduits: document.querySelector('[id=div_salle_equipement_edit]'),
    divFactureProduitsEdit: document.querySelector('[id=btn_equipement_ajouter]'),
    lblTotal: document.querySelector('[id=lbl_equipement_total]'),
    btnAjouterEquipt: document.querySelector('[id=table_equipement]'),
    tableFactureProduits: document.querySelector('[id=select_produit]'),
    edtQte: document.querySelector('[id=edt_produit_qte]'),
    listeFactureProduits: document.querySelector('[id=btn_equipement_valider]'),
    btnValiderProduits: document.querySelector('[id=btn_equipement_annuler]'),
    btnAnnulerProduits: document.querySelector('[id=lbl_erreur_select_equipement]'),
    lblQteErreur: document.querySelector('[id=lbl_erreur_qte]'),
    lblSelectProduitsErreur: document.querySelector('[id=kkk]')
});
//edt_facture_livraison
//# sourceMappingURL=facture_edit.js.map