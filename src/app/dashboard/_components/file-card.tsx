import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";

import {
    Check,
    Download,
    EllipsisVertical,
    File,
    FileCog,
    FileJson,
    FileText,
    ImageIcon,
    StarIcon,
    TrashIcon,
    UndoIcon
} from "lucide-react";

import { formatRelative } from 'date-fns'

import { Doc } from "../../../../convex/_generated/dataModel";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
import { useAuth } from "@clerk/clerk-react";


function FileCardActions({ file, isFavourite }: { file: Doc<"files">, isFavourite?: Boolean }) {
    const deleteFile = useMutation(api.files.deleteFile)
    const restoreFile = useMutation(api.files.restoreFile)
    const toggleFavourite = useMutation(api.files.toggleFavourite)

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
                                variant: "destructive",
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
                                onClick={() => toggleFavourite({ fileId: file._id })}
                            >
                                {isFavourite ?
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
                                condition={has => has({ role: "org:admin" }) || auth.orgId === null}
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


export default function FileCard({
    file,
    favorites
}: {
    file: Doc<"files">;
    favorites?: Doc<"favorites">[];
}) {

    let fileURL = useQuery(api.files.getFileURL, file.fileId ? { fileId: file.fileId } : 'skip')
    if (!fileURL) fileURL = ""

    const isFavourite = favorites?.some(favorite => favorite.fileId === file._id)
    const userProfile = useQuery(api.users.getUserProfile, { userId: file.userId });
    const typeIcons = {
        image: <ImageIcon />,
        pdf: <File />,
        txt: <FileText />,
        csv: <FileJson />,
        other: <FileCog />,
    } as Record<Doc<"files">["type"], ReactNode>

    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 max-sm:text-md text-2xl font-normal">
                    <span>
                        {typeIcons[file.type]}
                    </span>
                    <span className="w-[80%] overflow-hidden text-nowrap text-ellipsis">
                        {file.name}
                    </span>
                </CardTitle>
                <div className="absolute top-3 right-3">
                    <FileCardActions isFavourite={isFavourite} file={file} />
                </div>
            </CardHeader>
            <CardContent className="h-36 flex justify-center items-center w-auto">
                {file.type === 'image' &&
                    (fileURL ? <Image
                        alt={file.name}
                        src={fileURL}
                        width={250}
                        height={250}
                        style={{ width: "auto", height: "auto" }}
                        priority
                    />
                        :
                        file.name
                    )
                }
                {file.type === 'csv' && <FileJson className="w-20 h-20" />}
                {file.type === 'pdf' && <File className="w-20 h-20" />}
                {file.type === 'txt' && <FileText className="w-20 h-20" />}
                {file.type === 'other' && <FileCog className="w-20 h-20" />}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <div className="flex justify-left gap-2 text-sm text-gray-700">
                    <Avatar className="w-5 h-5 ring-1 ring-black">
                        <AvatarImage src={userProfile?.image} />
                        <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                    {userProfile?.name}
                </div>
                <div className="text-sm text-gray-700">
                    Uploaded {formatRelative(new Date(file._creationTime), new Date())}
                </div>
            </CardFooter>
        </Card >
    );
}