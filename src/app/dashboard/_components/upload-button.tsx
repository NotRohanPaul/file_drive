"use client"

import { useOrganization, useUser } from "@clerk/nextjs";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";

const formSchema = z.object({
    title: z.string().min(1).max(200),
    file: z.custom<FileList>((val) => val instanceof FileList, "Required").refine((files) => files.length > 0, "Required")
})


export default function UploadButton() {
    const { toast } = useToast()
    const organization = useOrganization()
    const user = useUser()
    const generateUploadUrl = useMutation(api.files.generateUploadUrl)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            file: undefined,
        },
    })

    const fileRef = form.register("file")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const postUrl = await generateUploadUrl();
        let fileType = values.file[0].type

        if (!fileType) {
            fileType = 'application/other';
        }

        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": fileType },
            body: values.file[0],
        })
        const { storageId } = await result.json()

        if (!orgId) return

        const types = {
            'image/png': "image",
            'application/pdf': "pdf",
            'text/plain': "txt",
            'text/csv': "csv",
            "application/other": "other",
        } as Record<string, Doc<"files">["type"]>

        try {
            await createFile({
                name: values.title,
                type: types[fileType] || "other",
                fileId: storageId,
                orgId,
            })

            setIsFileDialogOpen(false)

            toast({
                variant: "success",
                title: "File Uploaded",
                description: "Now everyone can view your file",
            })
        }
        catch (err) {

            setIsFileDialogOpen(false)

            toast({
                variant: "destructive",
                title: "Something went wrong",
                description: "Your file could not be uploaded, try again later",
            })
        }


    }

    let orgId: string | undefined = undefined;
    if (organization.isLoaded && user.isLoaded) {
        orgId = organization.organization?.id ?? user.user?.id;
    }

    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
    const createFile = useMutation(api.files.createFile)

    return (
        <Dialog open={isFileDialogOpen} onOpenChange={(isOpen) => {
            setIsFileDialogOpen(isOpen)
            form.reset();
        }}>
            <DialogTrigger asChild>
                <Button className="max-sm:text-sm">
                    Upload File
                </Button>
            </DialogTrigger>

            <DialogContent onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <DialogHeader>
                    <DialogTitle className="mb-8">Upload your File Here</DialogTitle>
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 text-left">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="My File" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="file"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>File</FormLabel>
                                        <FormControl>
                                            <Input type='file'
                                                {...fileRef}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                disabled={!form.formState.isDirty || !form.formState.isValid
                                }
                                className="flex gap-1"
                            >
                                {form.formState.isSubmitting && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Upload
                            </Button>
                        </form>
                    </Form>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
