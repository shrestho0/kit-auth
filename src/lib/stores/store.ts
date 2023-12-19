import { browser } from "$app/environment";
import { writable } from "svelte/store";


type UserAuthStore = {
    isAuthenticated: boolean,
    user_id: string | null,
    user_username: string | null,
}

const userAuthStore = writable<UserAuthStore>({
    isAuthenticated: false,
    user_id: null,
    user_username: null,
});

if (browser) {

    userAuthStore.subscribe((value) => {
        console.log("userAuthStore [[inside]]", value);
    });
}



export { userAuthStore }