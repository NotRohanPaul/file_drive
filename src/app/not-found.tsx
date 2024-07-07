import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className='h-[100vh] flex flex-col justify-center items-center gap-4 font-serif'>
            <h2 className='text-7xl font-bold' >Not Found</h2>
            <p className='text-2xl'>Could not find requested resource</p>
            <Button>
                <Link href="/dashboard/files">Return Home</Link>
            </Button>
        </div>
    )
}