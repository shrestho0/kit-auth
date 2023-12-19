<script lang="ts">
	export let data: Object = {};
	export let title: String = 'PreDebug';
</script>

<div class="m-2 p-2 border-2 border-black">
	<h2 class="title">Debug: {title}</h2>
	<pre>
{JSON.stringify(data, null, 2)}
    </pre>
</div>
