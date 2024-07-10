import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

crons.interval(
    "Delete files",
    { minutes: 60 },
    internal.files.deleteAllFiles,

)

export default crons