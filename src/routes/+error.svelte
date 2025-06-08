
<script lang="ts">
	import { page } from '$app/state';
</script>

<h1>{page.status} {page?.error?.message ? page?.error?.message : 'unexpected error'}</h1>