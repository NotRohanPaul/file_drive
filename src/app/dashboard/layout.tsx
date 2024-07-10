import { Footer } from "./footer";
import Header from "./header";
import { SideNav } from "./side-nav";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
            <header>
                <Header />
            </header>
            <main className="container mx-auto pt-12">
                <div className="flex gap-8">
                    <SideNav />
                    <div className="w-full">{children}</div>
                </div>
            </main >
            <footer>
                <Footer />
            </footer>
        </>
    );
}