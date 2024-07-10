import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    File,
    FileCog,
    FileJson,
    FileText,
    ImageIcon,
} from "lucide-react";

import { formatRelative } from 'date-fns'

import { Doc } from "../../../../convex/_generated/dataModel";
import { ReactNode, } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { FileCardActions } from "./file-actions";
import { UserAvatar } from "./user-avatar";



export default function FileCard({
    file
}: {
    file: Doc<"files"> & { isFavorited: boolean };
}) {

    let fileURL = useQuery(api.files.getFileURL, file.fileId ? { fileId: file.fileId } : 'skip')
    if (!fileURL) fileURL = ""

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
                <div className="absolute top-5 right-3">
                    <FileCardActions isFavorited={file.isFavorited} file={file} />
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
                <UserAvatar userProfile={userProfile} />
                <div className="text-sm text-gray-700">
                    Uploaded {formatRelative(new Date(file._creationTime), new Date())}
                </div>
            </CardFooter>
        </Card >
    );
}