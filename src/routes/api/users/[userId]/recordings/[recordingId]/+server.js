
import { error } from '@sveltejs/kit';
import fs from 'fs/promises'; // Using promises for async/await'
import path from 'path';
// const defaultFileLocation = 'src/lib/media';
// export async function GET({request, params}) {
  
//     const { recordings } = params;
    
//     const data = await fs.readFile(`${defaultFileLocation}/${filename}.ogg`);
//     console.log(data)
//     return json(data);
// }

export async function GET({ params }) {
    const { userId, recordingId } = params;
    console.log("getting recording; params are", params)
    const filePath = `src/lib/media/${userId}/${recordingId}.ogg`;

    try {
        const fileStats = await fs.stat(filePath);
        if (!fileStats.isFile()) {
            throw error(404, 'File not found');
        }

        // Determine Content-Type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream'; // Default
        if (ext === '.mp3') contentType = 'audio/mpeg';
        else if (ext === '.wav') contentType = 'audio/wav';
        else if (ext === '.ogg') contentType = 'audio/ogg';
        else if (ext === '.webm') contentType = 'audio/webm'; // Wavesurfer default for record plugin

        const fileContent = await fs.readFile(filePath);

        return new Response(fileContent, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileStats.size.toString(),
                'Cache-Control': 'public, max-age=31536000' // Cache for a year
            }
        });

    } catch (err) {
        if (err.code === 'ENOENT') { // File not found error
            throw error(404, 'File not found');
        }
        console.error(`Error serving file ${filePath}:`, err);
        throw error(500, 'Could not serve file');
    }
}