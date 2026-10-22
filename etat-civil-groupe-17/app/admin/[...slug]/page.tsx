import { notFound } from "next/navigation";

// Toute adresse inconnue de l'administration affiche la page « introuvable ».
export default function Page() {
    notFound();
}