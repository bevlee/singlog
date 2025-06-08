<script>
    import { page } from '$app/state';

    let projectName = $state("");
    let {data, children} = $props();
    const openProject = (projectName) => {
        projectName = projectName
    }
    console.log("aria currne is", page.url.pathname)

</script>

<nav class="main">

    <em>Singlog</em>
    <ul>
        <li>
            <a class="menuLink" href="/" aria-current={page.url.pathname === '/'}>home</a>
        </li>
        <li>
            <a class="menuLink" href="/projects" aria-current={page.url.pathname === '/projects'}>projects</a>
        </li>
        <li>
            <a class="menuLink" href="/create-project" aria-current={page.url.pathname === '/create-project'}>Create new Project</a>
        </li>
    </ul>
</nav>

{@render children()}
    <style>
        .main {
          display: flex;
          /* flex-direction: column; */
          align-items: center;
          background-color: aliceblue;
          font-size:x-large;
          padding:15px;
        }
          
        li{
            display : inline;
            padding:5px;
        }
        .menuLink {
            text-decoration: none;
        /* font-weight: bold; */
        }
        [aria-current]:not([aria-current="false"]) {
        text-decoration: underline;
        }
      </style>