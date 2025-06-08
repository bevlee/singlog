import { redirect } from '@sveltejs/kit';
export const actions = {
	createProject: async ({request, fetch}) => {
        console.log("creating project")
        console.log(request)
        const data = await request.formData();
		const projectName = data.get('name');
		const artist = data.get('artist');
        console.log(data)

		// try to create a project
        
        const response = await fetch(`/api/projects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectName: projectName,
                artistName: artist
            })
        });
        if (response.ok) {

            const body = await response.json();
            console.log(body)
            const projectId = body.project_id.lastInsertRowid;
            console.log(projectId)
            throw redirect(303, `/projects/${projectId}`)
        }
        else {
            console.log("response was not ok")
        }
        // throw redirect(307, /projects/)
	}
}