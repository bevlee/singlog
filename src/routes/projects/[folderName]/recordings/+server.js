
import { json } from '@sveltejs/kit';
import fs from 'fs/promises'; // Using promises for async/await'
import path from 'path';
const defaultFileLocation = 'src/lib/media';

//return a list of files (not directories) in  the folder param
export async function GET({request, params}) {
  
    const { directory } = params;

    let files = []
    let location = `${defaultFileLocation}/${directory}`
    
    // if (directory) {
    //     location = `${defaultFileLocation}/${directory}`
    // }
    try {

        // filter out directories
        const folder = await fs.readdir(location);
        for (const item of folder) {

            const itemPath = path.join(location, item);
            const stats = await fs.stat(itemPath);
            if (!stats.isDirectory()) {
                files.push(item);
            }
        }
    } catch (e) {
        console.log("errored", e)
    }
    // console.log("files is", files)
    
    return json(files);
    
}