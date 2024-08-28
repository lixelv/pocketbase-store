import type { Handle } from "@sveltejs/kit"
import PocketBase from "pocketbase"

const pb = new PocketBase("https://pocketbase-control-hub.fly.dev/")

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.pb = pb
    return resolve(event)
}
