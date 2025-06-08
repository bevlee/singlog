<script>
    let projectName = ""
    let artistName = ""

	// let { data, form } = $props();
    // console.log("data", data)
    // console.log("form", form)
</script>

<h1>Create a new project</h1>

<div class="submissionForm"> 
<form method="POST" action="?/createProject">

    Project Name: <input name="name" bind:value={projectName} > <br/><br/>
    Artist Name: <input name="artist" bind:value={artistName} ><br/><br/>
    <button formaction="?/createProject">Create</button>
    </form>
</div>


<style>
    .submissionForm {
        display: flex;
        flex-direction: column;
        padding:5px;
    }


</style>