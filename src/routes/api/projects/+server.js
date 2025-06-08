
import { createProject, getAllProjects } from "$lib/server/db";
import { json } from '@sveltejs/kit';


//gett all current projects
export async function GET({request, params}) {

    let projects = []
    try {
        projects = getAllProjects();
    } catch (e) {
        console.log("errored", e)
    }
    
    return json(projects);
}

//create new project
export async function POST({request, params}) {
    console.log("====================================================================")
    try { 
        const data = await request.json();
        console.log(data);
        const { projectName, artistName } = data;
        console.log("creating project with", projectName, artistName)
        const date = Date.now();
        const created_id = createProject(projectName, artistName, date);
        return json({project_id: created_id,  status:200})

    } catch (e) {
        console.log("errored", e)
    }
    
    return json({status:500})
}