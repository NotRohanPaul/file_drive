"use client"

import { useOrganization, useUser } from "@clerk/nextjs";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import UploadButton from "./upload-button";
import FileCard from "./file-card";
import SearchBar from "./search-bar"
import Image from "next/image";
import { Grid, Loader2, TableProperties } from "lucide-react";
import { useState } from "react";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


function PlaceHolder() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center  gap-2">
      <Image
        src={"../empty.svg"}
        alt="empty files"
        width={300}
        height={300}
        style={{ width: "auto", height: "auto" }}
      />
      <p className="text-2xl max-sm:text-sm text-center">
        You have no files to upload a file use the upload button
      </p>
      <UploadButton />
    </div>
  )
}

function Views({ modifiedFiles }: { modifiedFiles: any }) {
  return (
    <Tabs defaultValue={localStorage.view === 'table' ? "table-view" : "card-view"} className="flex flex-col mt-5">
      <TabsList className="self-end">
        <TabsTrigger value="card-view" onClick={() => localStorage.view = "card"}>
          <Grid />
        </TabsTrigger>
        <TabsTrigger value="table-view" onClick={() => localStorage.view = "table"}>
          <TableProperties />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="card-view">
        <div className="w-full grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-5 max-sm:flex max-sm:flex-col">
          {modifiedFiles?.map((file) => {
            return <FileCard key={file._id} file={file} />
          })}
        </div>
      </TabsContent>
      <TabsContent value="table-view">
        <DataTable columns={columns} data={modifiedFiles} />
      </TabsContent>
    </Tabs>
  )
}


export default function FileBrowser(
  { title,
    favoritesOnly,
    deletedOnly
  }: {
    title: string,
    favoritesOnly?: boolean,
    deletedOnly?: boolean
  }) {
  const organization = useOrganization()
  const user = useUser()
  const [query, setQuery] = useState("")

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favorites = useQuery(api.files.getAllFavorites, orgId ? { orgId } : 'skip')
  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites: favoritesOnly, deletedOnly } : 'skip')

  const isLoading = files === undefined

  const modifiedFiles =
    files?.map(
      (file) => JSON.parse(JSON.stringify({
        ...file,
        isFavorited: (favorites ?? []).some(
          (favorite) => favorite.fileId === file._id
        ),
      }))
    ) ?? [];


  return (<div className="w-full" >
    {!user.isSignedIn ?
      (
        <div className="text-center text-5xl font-bold">
          Sigin to continue
        </div>

      )
      :
      (
        <>
          <div className="flex flex-wrap justify-between items-center">
            <h1 className="text-3xl max-sm:text-xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadButton />
          </div>

          {isLoading ?
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
              <Loader2 className="w-32 h-32 animate-spin text-gray-700" />
              <p className="text-2xl max-sm:text-sm font-bold ml-5">Loading...</p>
            </div>
            :
            files?.length === 0 ? <PlaceHolder /> : <Views modifiedFiles={modifiedFiles} />
          }
        </>
      )
    }
  </div >)
}
