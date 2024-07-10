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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Doc } from "../../../../convex/_generated/dataModel";

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
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all")

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favorites = useQuery(api.files.getAllFavorites, orgId ? { orgId } : 'skip')
  const files = useQuery(api.files.getFiles, orgId ? { orgId, type: type === 'all' ? undefined : type, query, favorites: favoritesOnly, deletedOnly } : 'skip')

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
            <UploadButton />
          </div>

          <Tabs defaultValue={localStorage.view === 'table' ? "table-view" : "card-view"} className="flex flex-col mt-5 ">
            <div className="flex justify-end">
              <SearchBar query={query} setQuery={setQuery} />
              <TabsList className="self-end px-0 mb-2">
                <TabsTrigger value="card-view" className="ml-5 p-2" onClick={(): void => { localStorage.view = "card" }}>
                  <Grid />
                </TabsTrigger>
                <TabsTrigger value="table-view" className="mr-5 p-2" onClick={(): void => { localStorage.view = "table" }}>
                  <TableProperties />
                </TabsTrigger>
                <Select value={type} onValueChange={(e) => setType(e as any)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="csv">CSVs</SelectItem>
                    <SelectItem value="pdf">PDFs</SelectItem>
                    <SelectItem value="txt">TXTs</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </TabsList>
            </div>

            {isLoading ?
              <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-32 h-32 animate-spin text-gray-700" />
                <p className="text-2xl max-sm:text-sm font-bold ml-5">Loading...</p>
              </div>
              :
              files?.length === 0 ? <PlaceHolder /> :
                <>
                  <TabsContent value="card-view">
                    <ScrollArea className="h-[65vh]">
                      <div className="w-full grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-5 max-sm:flex max-sm:flex-col">
                        {modifiedFiles?.map((file: any) => {
                          return <FileCard key={file._id} file={file} />
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="table-view">
                    <ScrollArea className="h-[65vh]">
                      <DataTable columns={columns} data={modifiedFiles} />
                    </ScrollArea>
                  </TabsContent>
                </>
            }
          </Tabs>
        </>
      )
    }
  </div >)
}
