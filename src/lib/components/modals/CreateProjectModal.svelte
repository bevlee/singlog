<script>
	let { showModal = $bindable(), header, children, createSuccess } = $props();

	let dialog = $state(); // HTMLDialogElement

	$effect(() => {
		if (showModal) dialog.showModal();
	});

    let inputValue = $state("");
    let isProjectNameValid = $derived.by(()=> {
        console.log("input value is", inputValue)
        // check for invalid chars in filename for windows
        if (/[\\/:*?"<>|]/.test(inputValue)) {
            return false;
        }
        return true;
    })

    
 const isProjectNameUnique = async (name) => {
    
    let response =  await fetch(`/api/projects/${name}`, {
        method: 'POST'
    });
    console.log(response)
	return response.status === 200
}   

const createProject = async (projectName) => {
    console.log("project name is", projectName)
    const isNameUnique = await isProjectNameUnique(projectName);
    if (projectName.includes("/")) {
        alert("invalid project name, try again with no special characters")
    }
    if (isNameUnique) {
        //create the project
        let response  = await fetch(`/api/projects/${projectName}`, {
            method: 'post'
        })
        if (response.status === 200) {
            createSuccess(true);
			console.log(dialog)
		dialog.close()
        } else {
            alert("sorry the project couldnt be created")
			createSuccess(false);
			dialog.close()
        }
    }
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onclick={(e) => { if (e.target === dialog) dialog.close(); }}
>
	<div>
		{@render header?.()}
		<hr />
		{@render children?.()}
		<hr />
        <div class="footer"></div>
        
	<div>
        What would you like to name your project?
        <input type="text" maxLength=100 bind:value={inputValue}>
        {#if !isProjectNameValid}
        <p>Please ensure your project name does not contain any special characters</p>
        {/if}
    </div>
		<button onclick={() => dialog.close()}>cancel</button>
		<button onclick={async () => {console.log(inputValue); createProject(inputValue)}}>confirm</button>
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}

    .footer {
        display:block;
    }
</style>
