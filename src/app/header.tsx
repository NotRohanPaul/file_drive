"use client"

import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@clerk/clerk-react";
import { UserButton, SignInButton, SignOutButton, SignedOut, SignedIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Header() {
    return <div className="border-b bg-gray-50 px-10 py-5 max-sm:p-4  min-h-[80px] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2">
            <Image src={"/logo.png"} alt="file drive logo" width={25} height={0} />
            <a href={"/dashboard/files"} className="text-2xl max-sm:text-xl font-bold tracking-wide">
                FileDrive
            </a>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
            <OrganizationSwitcher />
            <UserButton />
            <SignedOut>
                <SignInButton signUpForceRedirectUrl={"/dashboard/files"}>
                    <Button className="max-sm:text-sm">Sign in</Button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <SignOutButton redirectUrl="/dashboard/files">
                    <Button className="max-sm:text-sm">Sign out</Button>
                </SignOutButton>
            </SignedIn>
        </div>
    </div >
}