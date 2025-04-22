// import { EmailFormValues } from "@/validation";

//  // Recherche par email
// export const onSearchByEmail = (data: EmailFormValues) => {
//     // Reset previous search results
//     setRequest(null);
//     setRequestsFound([]);
//     setSearchPerformed(true);

//     try {
//         // Dans un vrai cas, ce serait une requête Supabase
//         const requests = JSON.parse(
//             localStorage.getItem("requests") || "[]"
//         );

//         // Filtrer par email
//         const foundRequests = requests.filter(
//             (r: Request) =>
//                 r.email.toLowerCase() === data.email.toLowerCase()
//         );

//         if (foundRequests.length > 0) {
//             setRequestsFound(foundRequests);
//         }
//     } catch (error) {
//         console.error("Erreur lors de la recherche:", error);
//     }
// };
