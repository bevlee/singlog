
import { json } from '@sveltejs/kit';
import fs from 'fs/promises'; // Using promises for async/await'
import path from 'path';
const defaultFileLocation = 'src/lib/media';

//gett all current projects
export async function GET({request, params}) {

    let files = []
    let location = `${defaultFileLocation}`
    
    try {

        // filter out non-directories
        const folder = await fs.readdir(location);
        for (const item of folder) {

            const itemPath = path.join(location, item);
            const stats = await fs.stat(itemPath);
            if (stats.isDirectory()) {
                files.push(item);
            }
        }
    } catch (e) {
        console.log("errored", e)
    }
    
    return json(files);
}