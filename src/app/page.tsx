"use client"

import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import UploadButton from "./upload-button";
import FileCard from "./file-card";

export default function Home() {
  const organization = useOrganization()
  const user = useUser()

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : 'skip')

  return (
    <main className="container mx-auto pt-12 max-sm:p-2">
      <div className="flex justify-between">
        <h1 className="text-3xl max-sm:text-xl font-bold">Your Files</h1>
        <UploadButton />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] max-sm:grid-cols-[1fr] gap-5 mt-4 auto-rows-[200px]">
        {files?.map((file) => {
          return <FileCard key={file._id} file={file} />
        })}
      </div>


    </main >
  );
}
