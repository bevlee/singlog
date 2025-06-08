
import json from '@sveltejs/kit';
import fs from 'fs/promises'; // Using promises for async/await'

const defaultFileLocation = 'src/lib/media';
export async function GET({request, params}) {
  
    const { filename } = params;
    const data = await fs.readFile(`${defaultFileLocation}/${filename}.ogg`);
    console.log(data)
    return json(data);
}