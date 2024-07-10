import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserAvatar({ userProfile }: {
    userProfile: {
        name: string | undefined;
        image: string | undefined;
    } | undefined
}) {

    return (
        <div className="flex justify-left gap-2 text-sm text-gray-700">
            <Avatar className="w-5 h-5 ring-1 ring-black">
                <AvatarImage src={userProfile?.image} />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {userProfile?.name}
        </div>
    )
}