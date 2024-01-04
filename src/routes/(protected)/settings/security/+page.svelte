Security Settings

<script lang="ts">

    export let data: any;

    import PreDebug from '$lib/dev/PreDebug.svelte';
</script>


<PreDebug data={data?.UserOauthProviders} title="Auth Methods" />
<PreDebug data={data?.UserDevices} title="User Auth Devices" />
