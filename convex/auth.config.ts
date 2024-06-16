export default {
    providers: [
        {
            domain: process.env.CLERK_DOMAIN as string,
            applicationID: "convex",
        },
    ]
};