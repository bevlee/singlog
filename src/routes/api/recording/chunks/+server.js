
import { json } from '@sveltejs/kit';
import fs from 'fs';
const uploadStreams = new Map();

import { createRecording } from '$lib/server/db';
const defaultFileLocation = 'src/lib/media';


export async function GET({request, params}) {
  
    const { filename } =params;
    const data = await fs.readFile(`${defaultFileLocation}/${filename}.ogg`);
    console.log(data)
    return json(data);
}

export async function POST({request, params}) {
  try {

    console.log("in post for /recording/chunks")
    const formData = await request.formData();
    const uuid = formData.get('recordingId');
    const chunk = formData.get('chunk');
    const isFinal = formData.get('isFinal');
    const projectName = formData.get('projectName');
    const projectId = formData.get('projectId');
    const artistName = formData.get('artistName');
    const currentUser = "user" //TODO: Add login and users
    // name dir based on username, artist and project name to ensure uniqueness
    const projectDirectory = `${currentUser}-${artistName}-${projectName}`
    const projectPath = `${defaultFileLocation}/${projectDirectory}`;
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath)
    }
    const finalFilePath = `${projectPath}/${uuid}.ogg`;

    if (!uploadStreams.has(uuid)) {
      // Create a new write stream if it doesn't exist for this uuid
      const writeStream = fs.createWriteStream(finalFilePath, { flags: 'a' }); // 'a' for append
      uploadStreams.set(uuid, writeStream);

      writeStream.on('error', (err) => {
          console.error('Error writing chunk:', err);
          uploadStreams.delete(uuid);
      });
    } 
    const writeStream = uploadStreams.get(uuid);
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    writeStream.write(buffer, (err) => {
      if (err) {
          console.error('Error writing chunk:', err);
          uploadStreams.delete(uuid);
      }
    });

    if (isFinal) {
        // Close the stream when all chunks are received
        writeStream.end(() => {
            console.log(`Upload ${uuid} complete`);
            uploadStreams.delete(uuid);
        });
        
        //write to db
        console.log("creating recording", uuid, projectId, finalFilePath, Date.now())
        createRecording(uuid, 1, projectId, finalFilePath, Date.now())
        
        return json({ message: 'File upload complete' }, { status: 200 });
    }

    return json({ message: 'Chunk received' }, { status: 202 });
  } catch (error) {
    console.log(error)
        return json({ error: 'Failed to process chunk' }, { status: 500 });
  }
}