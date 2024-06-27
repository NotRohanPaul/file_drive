"use client"

import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import UploadButton from "./upload-button";
import FileCard from "./file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Home() {
  const organization = useOrganization()
  const user = useUser()

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip')
  const isLoading = files === undefined

  return (
    <main className="container pt-12 max-sm:p-4 mb-5 max-sm:mb-0">
      {isLoading &&
        <div className="h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-32 h-32 animate-spin text-gray-700" />
          <p className="text-2xl max-sm:text-sm font-bold">Loading...</p>
        </div>

      }

      {!isLoading && files?.length === 0
        &&
        <div className="h-[60vh] flex flex-col items-center justify-center gap-2">
          <Image
            src={"./empty.svg"}
            alt="empty files"
            width={300}
            height={300}
          />
          <p className="text-2xl max-sm:text-sm text-center">
            You have no files to upload a file use the upload button
          </p>
          <UploadButton />
        </div>
      }

      {!isLoading && files.length > 0 &&
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl max-sm:text-xl font-bold">Your Files</h1>
            <UploadButton />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-5 mt-4">
            {files?.map((file) => {
              return <FileCard key={file._id} file={file} />
            })}
          </div>
        </>
      }
    </main >
  );
}
