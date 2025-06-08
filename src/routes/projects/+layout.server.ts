import type { PageLoad } from './$types';

import { getAllProjects } from "$lib/server/db";

export const load: PageLoad = async ({ fetch, params }) => {
    
    console.log("loading all projects")
    let allProjects = await getAllProjects()
	return {projects: allProjects}
}
