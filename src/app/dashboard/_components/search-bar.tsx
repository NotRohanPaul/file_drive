import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, SearchIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
    query: z.string().min(0).max(200)
})

export default function SearchBar({ query, setQuery }: { query: string, setQuery: Dispatch<SetStateAction<string>> }) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setQuery(values.query)
    }


    return (<div>
        <Form {...form} >
            <form onSubmit={
                form.handleSubmit(onSubmit)
            } className="flex items-center gap-1">
                <FormField
                    control={form.control}
                    name="query"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input  {...field} className="w-[30vw] rounded-sm focus-visible:ring-0 focus-visible:outline focus-visible:outline-2" placeholder="Your file name" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="flex gap-1 rounded-sm p-3"
                >
                    {form.formState.isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    <SearchIcon className="p-0 w-4 h-4" />Search
                </Button>
            </form>
        </Form>
    </div >)
}