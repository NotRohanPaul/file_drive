"use client"

import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import UploadButton from "./upload-button";
import FileCard from "./file-card";
import SearchBar from "./search-bar"
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";


function PlaceHolder() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center  gap-2">
      <Image
        src={"../empty.svg"}
        alt="empty files"
        width={300}
        height={300}
      />
      <p className="text-2xl max-sm:text-sm text-center">
        You have no files to upload a file use the upload button
      </p>
      <UploadButton />
    </div>
  )
}


export default function FileBrowser({ title, favorites }: { title: string, favorites?: boolean }) {
  const organization = useOrganization()
  const user = useUser()
  const [query, setQuery] = useState("")

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites } : 'skip')
  const isLoading = files === undefined

  return (<div className="w-full" >
    {!user.isSignedIn ?
      (
        <div className="text-center text-5xl font-bold">
          Sigin to continue
        </div>

      )
      :
      (
        <div>
          {isLoading &&
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
              <Loader2 className="w-32 h-32 animate-spin text-gray-700" />
              <p className="text-2xl max-sm:text-sm font-bold ml-5">Loading...</p>
            </div>
          }

          {!isLoading &&
            <>
              <div className="flex flex-wrap justify-between items-center">
                <h1 className="text-3xl max-sm:text-xl font-bold">{title}</h1>
                <SearchBar query={query} setQuery={setQuery} />
                <UploadButton />
              </div>

              {files?.length === 0 &&
                <PlaceHolder />
              }

              <div className="w-full grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-5 mt-4 max-sm:flex max-sm:flex-col">
                {files?.map((file) => {
                  return <FileCard key={file._id} file={file} />
                })}
              </div>
            </>
          }
        </div>
      )
    }
  </div >
  )
}
