"use client"

import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@clerk/clerk-react";
import { UserButton, SignInButton, SignOutButton, SignedOut, SignedIn } from "@clerk/nextjs";

export default function Header() {
    return <div className="border-b bg-gray-50 px-10 py-5 max-sm:p-2  min-h-[80px] flex justify-between items-center max-sm:flex-col">
        <div className="text-3xl max-sm:text-xl font-bold tracking-wide max-sm:self-start">FileDrive</div>
        <div className="flex justify-end gap-2 max-sm:max-sm:self-end">
            <OrganizationSwitcher />
            <UserButton />
            <SignedOut>
                <SignInButton><Button className="max-sm:text-sm">Sign in</Button></SignInButton>
            </SignedOut>
            <SignedIn>
                <SignOutButton><Button className="max-sm:text-sm">Sign out</Button></SignOutButton>
            </SignedIn>
        </div>
    </div >
}