export class Acte {
  id: string;
  demandeId: string;
  dateDelivrance: Date;
  fichierPdf: string;
  signatureNumerique: string;
  estArchive: boolean;
  dateArchivage?: Date;
}
