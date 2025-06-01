
import { json } from '@sveltejs/kit';
import fs from 'fs';
const uploadStreams = new Map();

const defaultFileLocation = 'src/lib/media';


export async function GET({request, params}) {
  
    const { filename } =params;
    const data = await fs.readFile(`${defaultFileLocation}/${filename}.ogg`);
    console.log(data)
    return json(data);
}

export async function POST({request, params}) {
  try {

    console.log("in post for /file/[chunk]")
    const formData = await request.formData();
    const fileId = formData.get('recordingId');
    const chunk = formData.get('chunk');
    const isFinal = formData.get('isFinal');


    const finalFilePath = `${defaultFileLocation}/${fileId}.ogg`;
    if (!uploadStreams.has(fileId)) {
      // Create a new write stream if it doesn't exist for this fileId
      const writeStream = fs.createWriteStream(finalFilePath, { flags: 'a' }); // 'a' for append
      uploadStreams.set(fileId, writeStream);

      writeStream.on('error', (err) => {
          console.error('Error writing chunk:', err);
          uploadStreams.delete(fileId);
      });
    } 
    const writeStream = uploadStreams.get(fileId);
    const arrayBuffer = await chunk.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    writeStream.write(buffer, (err) => {
        if (err) {
            console.error('Error writing chunk:', err);
            uploadStreams.delete(fileId);
            // Optionally notify the client
        }
    });

    if (isFinal) {
        // Close the stream when all chunks are received
        writeStream.end(() => {
            console.log(`Upload ${fileId} complete`);
            uploadStreams.delete(fileId);
        });
        return json({ message: 'File upload complete' }, { status: 200 });
    }

    return json({ message: 'Chunk received' }, { status: 202 });
  } catch (error) {
    console.log(error)
        return json({ error: 'Failed to process chunk' }, { status: 500 });

  }
// 	try {

//     const { filename } = params;
//     console.log("request is" , request);
//     const { content } = await request.blob(); // Assume JSON body
//     console.log("content is" , content)
//     fs.writeFile(`${filename}.ogg`, content);
//     return json({ status: 200 });
//   } catch (error) {
//     console.log("error is", error)
//     return json({ error: 'Failed to write file' }, { status: 500 });
//   }
}