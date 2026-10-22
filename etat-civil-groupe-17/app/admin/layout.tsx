import { ReactNode } from "react";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    // const session = await getSession();
    // console.log(session);

    return (
        <html lang="fr" suppressHydrationWarning>
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
