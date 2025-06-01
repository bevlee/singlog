<script>
import Header from '../components/Header.svelte';
import HomePage from '../components/HomePage.svelte';
import ProjectPage from '../components/ProjectPage.svelte';
import Sidebar from '../components/Sidebar.svelte';
let projectName = $state("");

const openProject = (projectName) => {
    projectName = projectName
}
</script>

<div class="main"> 
    <div class="header">
      <Header />
    </div> 
    <div class="container">
      <aside class="sidebar">       
        <Sidebar />  
      </aside>
      <div class="mainContent"> 
        {#if projectName === ""}
            <HomePage changeProject={() => {openProject}}/>
        {:else}
            <ProjectPage {projectName}/>
        {/if }
      </div>
    </div>
</div>



<style>
    .main {
      display: flex;
      flex-direction: column;
      height:100vh;
    }
    .container {
      display: flex;
      flex-direction: row;
      height:100%;
    }
    .sidebar {
      width: 8%;
      min-width: 150px;
      height: 100%;
      background-color: #424564;
      overflow-y: scroll;
    }
  
    .header {
      height: 50px;
      width: 100%;
      background-color: #123231;
    }
  
    .mainContent {
      flex-grow: 1;
      background-color: #555555;
    }
  </style>