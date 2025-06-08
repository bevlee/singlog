
import { json } from '@sveltejs/kit';
import fs from 'fs/promises'; // Using promises for async/await'

import { getAllProjects } from "$lib/server/db";
const defaultFileLocation = 'src/lib/media';

//return whether the project exists
export async function GET({request, params}) {
  
    const allProjects = getAllProjects();

    
    
    try {

        // check if project dir exists
        let exists = await fs.access(location);
        console.log(exists)
        if (exists) return json({status:200})
    } catch (e) {
        console.log("errored", e)
    }
    
    return json({status:404})
}
