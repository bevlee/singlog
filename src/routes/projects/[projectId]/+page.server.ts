import { getAllProjects } from "$lib/server/db";
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
export const load: PageLoad = ({ params }) => {
    const projectId: number = params.projectId;
    const allProjects = getAllProjects();
    
    for (const project of allProjects) {
        if (project.projectId == projectId) {
            return {project: project}
        }
    }
    return error(404, {
        message: 'Project Not found'
    });
}