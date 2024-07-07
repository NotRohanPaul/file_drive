"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { FileIcon, StarIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SideNav() {
    const pathname = usePathname();
    const user = useUser()

    if (user.isSignedIn)
        return (
            <div className="w-40 flex flex-col gap-4">
                <Link href="/dashboard/files">
                    <Button
                        variant={"link"}
                        className={`flex gap-2 ${pathname.includes("/dashboard/files") && 'text-blue-500'}`}
                    >
                        <FileIcon /> All Files
                    </Button>
                </Link>

                <Link href="/dashboard/favorites">
                    <Button
                        variant={"link"}
                        className={`flex gap-2 ${pathname.includes("/dashboard/favorites") && 'text-blue-500'}`}
                    >
                        <StarIcon /> Favorites
                    </Button>
                </Link>

                <Link href="/dashboard/trash">
                    <Button
                        variant={"link"}
                        className={`flex gap-2 ${pathname.includes("/dashboard/trash") && 'text-blue-500'}`}
                    >
                        <TrashIcon /> Trash
                    </Button>
                </Link>
            </div >
        );
}