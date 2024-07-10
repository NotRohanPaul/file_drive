"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { formatRelative } from "date-fns"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { FileCardActions } from "./file-actions"
import { UserAvatar } from "./user-avatar"


function UserCell({ userId }: { userId: Id<"users"> }) {
    const userProfile = useQuery(api.users.getUserProfile, { userId: userId })
    return (<UserAvatar userProfile={userProfile} />)
}

export const columns: ColumnDef<Doc<"files"> & { isFavorited: boolean }>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        header: 'User',
        cell: ({ row }) => {
            return (
                <UserCell userId={row.original.userId} />
            )
        }
    },
    {
        header: 'Uploaded On',
        cell: ({ row }) => {
            return (
                <div>
                    {formatRelative(new Date(row.original._creationTime), new Date())}
                </div >
            )
        }
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            return (
                <div>
                    {<FileCardActions isFavorited={row.original.isFavorited} file={row.original} />}
                </div >
            )
        },
    },
]
