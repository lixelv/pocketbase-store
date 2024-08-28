export async function load({ locals }) {
    const result = await locals.pb
        .collection("test")
        .getFullList({ sort: "-name,-created" })

    return { test: result }
}
