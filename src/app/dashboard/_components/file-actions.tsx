import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
    Check,
    Download,
    EllipsisVertical,
    ImageIcon,
    StarIcon,
    TrashIcon,
    UndoIcon
} from "lucide-react";


import { Doc } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Protect } from "@clerk/nextjs";
import { useAuth } from "@clerk/clerk-react";


export function FileCardActions({ file, isFavorited }: { file: Doc<"files">, isFavorited: boolean }) {
    const deleteFile = useMutation(api.files.deleteFile)
    const restoreFile = useMutation(api.files.restoreFile)
    const toggleFavorite = useMutation(api.files.toggleFavorite)

    const auth = useAuth()
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const { toast } = useToast()

    let fileURL = useQuery(api.files.getFileURL, file.fileId ? { fileId: file.fileId } : 'skip')
    if (!fileURL) {
        fileURL = ""
    }



    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen} >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for deletion process. Files are deleted preodically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter >
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                            await deleteFile({ fileId: file._id, })
                            toast({
                                variant: "default",
                                title: "File marked for deletion",
                                description: "Your file will be deleted soon.",
                            })
                        }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuItem
                        className="flex items-center gap-1 text-black cursor-pointer"
                        onClick={() => {
                            window.open(fileURL, "_blank")
                        }}>
                        <Download className="w-4 h-4" />
                        Download
                    </DropdownMenuItem>



                    {file.shouldDelete ?
                        <DropdownMenuItem
                            className="flex items-center gap-1 text-green-600 cursor-pointer"
                            onClick={
                                async () => {
                                    await restoreFile({ fileId: file._id, })
                                    toast({
                                        variant: "success",
                                        title: "File is successfully restored",
                                        description: "Your file is restored from trash.",
                                    })
                                }
                            }
                        >
                            <>
                                <UndoIcon className="w-4 h-4" />
                                Restore
                            </>
                        </DropdownMenuItem>
                        :
                        <>
                            <DropdownMenuItem
                                className="flex items-center gap-1 text-yellow-600 cursor-pointer"
                                onClick={() => toggleFavorite({ fileId: file._id })}
                            >
                                {isFavorited ?
                                    <>
                                        <Check className="w-4 h-4" /> Unfavorite
                                    </>
                                    :
                                    <>
                                        <StarIcon className="w-4 h-4" /> Favorite
                                    </>
                                }
                            </DropdownMenuItem>

                            <Protect
                                condition={has => has({ role: "org:admin" }) || auth.userId === file.orgId}
                                fallback={<></>}
                            >
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="flex items-center gap-1 text-red-600 cursor-pointer"
                                    onClick={() => {
                                        setIsConfirmOpen(true)

                                    }
                                    }
                                >
                                    <>
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </>
                                </DropdownMenuItem>
                            </Protect>
                        </>
                    }


                </DropdownMenuContent>

            </DropdownMenu >
        </>
    )
}
