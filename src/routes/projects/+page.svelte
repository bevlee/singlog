<script>
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
const {  data } = $props();

let projects = data.projects;
console.log("hello im in the svelte file")
console.log(data)

// rerender the page on project change

onMount(() => {
    const interval = setInterval(() => {
        invalidate('/api/now');
    }, 1000);

    return () => {
        clearInterval(interval);
    };
});
</script>
<p>Here are all your projects</p>
<div>
    <ul>
        {#each projects as project}
            <li>
                <a href="/projects/{project.projectId}">{project.projectName} - {project.artistName}</a>
            </li>
        {/each}
    </ul>
</div>