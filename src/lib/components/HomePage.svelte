
<script>

import Modal from './modals/CreateProjectModal.svelte';
const {changeProject}  = $props();
let showModal = $state(false);
let projectCreated = $state(false);


///display a toast on success or failure
let createSuccess = (success) => {
    if (success) {

    }
    return success;
};


let allProjects = $state([]);
const openNewProjectModal =  () => {
    showModal = true;
}

const loadProjects = async () => {
    return await fetch('/api/projects');
}

</script>


<h1> Homepage </h1>

<Modal bind:showModal bind:projectCreated {createSuccess}>
	{#snippet header()}
		<h2>
			Create a new project <br/>
		</h2>
	{/snippet}

</Modal>


<button onclick={openNewProjectModal}> Create new Project</button>
<style>
    
</style>