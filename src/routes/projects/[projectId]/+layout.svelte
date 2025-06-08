<script>
        
	let { data, children } = $props();
    let { projects} = data

    </script>

<div class="main"></div>
    <main>{@render children()}</main>

	<aside>
		<h2>More Projects</h2>
		<ul>
			{#each projects as project}
				<li>
					<a href="/projects/{project.projectId}">{project.projectName} - {project.artistName}</a>
				</li>
			{/each}
		</ul>
	</aside>


<style>
	.main {
		display:grid;
	}

	.main * {
		display:block;
	}

</style>