"use client"

import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@clerk/clerk-react";
import { UserButton, SignInButton, SignOutButton, SignedOut, SignedIn } from "@clerk/nextjs";

export default function Header() {
    return <div className="border-b bg-gray-50 px-10 py-5">
        <div className="flex justify-between items-center">
            <div className="text-3xl font-bold tracking-wide">FileDrive</div>
            <div className="flex gap-2">
                <OrganizationSwitcher />
                <UserButton />
                <SignedOut>
                    <SignInButton><Button>Sign in</Button></SignInButton>
                </SignedOut>
                <SignedIn>
                    <SignOutButton><Button>Sign out</Button></SignOutButton>
                </SignedIn>
            </div>
        </div>
    </div>
}