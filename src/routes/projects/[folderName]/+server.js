
import { json } from '@sveltejs/kit';
import fs from 'fs/promises'; // Using promises for async/await'
const defaultFileLocation = 'src/lib/media';

//return whether the project exists
export async function GET({request, params}) {
  
    const { folderName } = params;

    let files = []
    let location = `${defaultFileLocation}/${folderName}`
    
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
//create new project
export async function POST({request, params}) {
  
    const { folderName } = params;

    let location = `${defaultFileLocation}/${folderName}`
    
    try {

            let a = await fs.mkdir(location, {recursive: true});
            console.log(a)
            return json({status:204})

    } catch (e) {
        console.log("errored", e)
    }
    
    return json({status:500})
}