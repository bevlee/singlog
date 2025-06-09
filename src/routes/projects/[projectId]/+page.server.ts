
import { getAllProjects, getRecordings } from "$lib/server/db";
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
    const projectId: number = params.projectId;
    const allProjects = getAllProjects();
    const userId = 1; //TODO login system
    for (const project of allProjects) {
        if (project.projectId == projectId) {
            const allRecordings = getRecordings(projectId);

            return {project: project, recordings: allRecordings}
        }
    }
    return error(404, {
        message: 'Project Not found'
    });
}


// const getRecordingsForProject = async (userId, projectId, fetch) => {
//     const timeout = 1000;
//     setTimeout(() => {
//         console.log("timeout for ", timeout)
//     }, timeout);
//     // get all recordings for this 
//     console.log("params are", userId, projectId)
//     const allRecordings = getRecordings(projectId);
//     console.log(allRecordings)

//     let recordings = []

//     for (const recording of allRecordings) {
//         const audioFile = await fetch(`/api/users/${userId}/recordings/${recording.recordingId}`)
//         console.log(audioFile)
//         recordings.push(audioFile)
//     }


//     return recordings;
// }