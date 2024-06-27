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
    DropdownMenuItem
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

import { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, File, FileJson, FileText, FileTextIcon, GanttChart, GanttChartIcon, ImageIcon, TrashIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

function FileCardActions({ file }: { file: Doc<"files"> }) {
    const deleteFile = useMutation(api.files.deleteFile)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const { toast } = useToast()


    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen} >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your file from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter >
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                            await deleteFile({ fileId: file._id, })
                            toast({
                                variant: "default",
                                title: "File Deleted",
                                description: "Your file is permanently deleted from our server",
                            })
                        }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                <DropdownMenuContent onCloseAutoFocus={(e) => e.preventDefault()}>
                    <DropdownMenuItem
                        className="flex items-center gap-1 text-red-600 cursor-pointer"
                        onClick={() => setIsConfirmOpen(true)}
                    >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )

}




export default function FileCard({ file }: { file: Doc<"files"> }) {

    let fileURL = useQuery(api.files.getFileURL, file.fileId ? { fileId: file.fileId } : 'skip')

    if (!fileURL) {
        fileURL = ""
    }

    const typeIcon = {
        image: <ImageIcon />,
        pdf: <File />,
        txt: <FileText />,
        csv: <FileJson />,
    } as Record<Doc<"files">["type"], ReactNode>

    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2 whitespace-pre max-sm:text-md">
                    {typeIcon[file.type]} {" "} {file.name}
                </CardTitle>
                <div className="absolute top-3 right-3">
                    <FileCardActions file={file} />
                </div>
            </CardHeader>
            <CardContent className="h-36 flex justify-center items-center">
                {file.type === 'image' &&
                    <Image
                        alt={file.name}
                        src={fileURL}
                        width={250}
                        height={250}
                    />
                }
                {file.type === 'csv' && <FileJson className="w-20 h-20" />}
                {file.type === 'pdf' && <File className="w-20 h-20" />}
                {file.type === 'txt' && <FileText className="w-20 h-20" />}
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button>Download</Button>
            </CardFooter>
        </Card >
    );
}