import { ConvexError, v } from "convex/values"
import { MutationCtx, QueryCtx, internalMutation, mutation, query } from "./_generated/server"
import { fileTypes } from "./schema"
import { Id } from "./_generated/dataModel"

async function hasAccessToOrg(
    ctx: QueryCtx | MutationCtx,
    orgId: string
) {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
        return null
    }
    const user = await ctx.db
        .query("users")
        .withIndex('by_tokenIdentifier', (q) =>
            q.eq("tokenIdentifier", identity.tokenIdentifier))
        .first();

    if (!user) {
        return null
    }

    const hasAccess = user.orgIds.some(itme => itme.orgId === orgId) ||
        user.tokenIdentifier.includes(orgId);

    if (!hasAccess) return null

    return { user }
}

async function hasAccessToFile(ctx: QueryCtx | MutationCtx, fileId: Id<"files">) {
    const file = await ctx.db.get(fileId)

    if (!file) {
        return null
    }

    const access = await hasAccessToOrg(ctx, file.orgId)

    if (!access) {
        return null
    }

    return { user: access.user, file }
}



export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
        throw new ConvexError("You must be logged in to upload a file")
    }

    return await ctx.storage.generateUploadUrl()
})



export const createFile = mutation({
    args: {
        name: v.string(),
        type: fileTypes,
        fileId: v.id("_storage"),
        orgId: v.string(),
    },
    async handler(ctx, args) {

        const hasAccess = await hasAccessToOrg(ctx, args.orgId)

        if (!hasAccess) {
            throw new ConvexError("you do not have access to this org")
        }

        await ctx.db.insert("files", {
            name: args.name,
            orgId: args.orgId,
            fileId: args.fileId,
            type: args.type,
            userId: hasAccess.user._id
        });
    },
})

export const getFiles = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favorites: v.optional(v.boolean()),
        deletedOnly: v.optional(v.boolean()),
        type: v.optional(fileTypes)
    },
    async handler(ctx, args) {

        const hasAccess = await hasAccessToOrg(ctx, args.orgId)

        if (!hasAccess) {
            return []
        }

        let files = await ctx.db.query('files').withIndex('by_orgId', q => q.eq('orgId', args.orgId)).collect()

        const query = args.query;

        if (query)
            files = files.filter(file => file.name.toLowerCase().includes(query.toLowerCase()))

        if (args.favorites) {
            const favorites = await ctx.db.query("favorites")
                .withIndex("by_userId_orgId_fileId",
                    q => q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId))
                .collect()

            files = files.filter(file => favorites.some((f) => f.fileId === file._id))
        }

        if (!args.deletedOnly) {
            files = files.filter(file => !file.shouldDelete)
        }
        else {
            files = files.filter(file => file.shouldDelete)
        }

        if (args.type) {
            files = files.filter((file) => file.type === args.type)
        }

        return files

    }
})

export const getFileURL = query({
    args: {
        fileId: v.id("_storage"),
    },
    async handler(ctx, args) {
        const fileURL = await ctx.storage.getUrl(args.fileId);

        return fileURL;
    },
});

export const toggleFavorite = mutation({
    args: { fileId: v.id("files") },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId)

        if (!access) {
            throw new ConvexError("No access to file")
        }

        const favorite = await ctx.db.query('favorites')
            .withIndex('by_userId_orgId_fileId',
                q => q.eq("userId", access.user._id).eq("orgId", access.file.orgId).eq("fileId", access.file._id))
            .first()

        if (!favorite) {
            await ctx.db.insert('favorites', {
                userId: access.user._id,
                orgId: access.file.orgId,
                fileId: access.file._id,
            })
        }
        else {
            await ctx.db.delete(favorite._id)
        }
    }
})

export const getAllFavorites = query({
    args: { orgId: v.string() },
    async handler(ctx, args) {
        const access = await hasAccessToOrg(ctx, args.orgId)

        if (!access) {
            return []
        }

        const favorites = await ctx.db.query('favorites')
            .withIndex('by_userId_orgId_fileId',
                q => q.eq("userId", access.user._id).eq("orgId", args.orgId))
            .collect()

        return favorites
    }
})


export const deleteFile = mutation({
    args: { fileId: v.id("files") },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId)

        if (!access) {
            throw new ConvexError("No access to file")
        }

        if (!access.file.orgId.startsWith('user')) {
            const isAdmin = access.user.orgIds.find(org => org.orgId === access.file.orgId)?.role === "admin";
            if (!isAdmin)
                throw new ConvexError("You have no admin access to delete!")
        }


        await ctx.db.patch(args.fileId, {
            shouldDelete: true
        })
    }
})

export const restoreFile = mutation({
    args: { fileId: v.id("files") },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId)

        if (!access) {
            throw new ConvexError("No access to file")
        }

        if (!access.file.orgId.startsWith('user')) {
            const isAdmin = access.user.orgIds.find(org => org.orgId === access.file.orgId)?.role === "admin";
            if (!isAdmin)
                throw new ConvexError("You have no admin access to restore!")
        }

        await ctx.db.patch(args.fileId, {
            shouldDelete: false
        })
    }
}
)

export const deleteAllFiles = internalMutation(
    {
        args: {},
        async handler(ctx) {
            const files = await ctx.db.query("files").withIndex("by_shouldDelete", q => q.eq("shouldDelete", true)).collect()

            await Promise.all(
                files.map(
                    async file => {
                        await ctx.storage.delete(file.fileId)
                        return await ctx.db.delete(file._id)
                    }

                ))
        }
    }
)