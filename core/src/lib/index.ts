import {
    createPocketBaseListStore,
    createPocketBaseOneStore,
} from "./stores.js"

export const pbStore = {
    list: createPocketBaseListStore,
    one: createPocketBaseOneStore,
}
