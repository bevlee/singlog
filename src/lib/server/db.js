import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module, equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../../singlog.db'); 

// Initialize the database connection. This happens only once when the module is first imported.
const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Set WAL mode for better concurrency and data integrity

const createProjectTable = `
    CREATE TABLE IF NOT EXISTS project (
        project_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        project_name TEXT NOT NULL,
        artist_name TEXT,
        creation_date INTEGER,
        video_url TEXT
    );
`;

const createUserTable = `
    CREATE TABLE IF NOT EXISTS user ( 
        user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        user_name TEXT,
        creation_date INTEGER
    );
`;

const createRecordingsTable = `
    CREATE TABLE IF NOT EXISTS recording ( 
        recording_id INTEGER PRIMARY KEY AUTOINCREMENT,
        recording_name TEXT,
        file_uuid TEXT NOT NULL UNIQUE,
        project_id INTEGER NOT NULL,
        creator_id INTEGER NOT NULL,
        recording_location TEXT,
        creation_date INTEGER NOT NULL,
        last_modified_date INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES project(project_id),
        FOREIGN KEY (creator_id) REFERENCES user(user_id)
    );
`;

// TODO: Create a notes table on project id and a tags table on recording_id

const initTableStatements = [ 
    createProjectTable,
    createUserTable,
    createRecordingsTable,
];

const initializeTables = () => { 
    console.log("Checking and initializing database tables...");

    // Check if tables exist by querying sqlite_master
    const query = `
    SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
    `;
    const tables = db.prepare(query).all();

    console.log('Existing tables in DB:', tables.map(t => t.name));

    // If no custom tables are found, create them
    if (tables.length === 0) { // Check for 0 tables instead of < 1, as 'sqlite_%' tables might exist
        console.log("No custom tables found. Creating them now...");
        for (const statement of initTableStatements) {
            try {
                db.prepare(statement).run();
                console.log(`Successfully executed: ${statement.substring(0, 50)}...`);
            } catch (error) {
                console.error(`Error executing statement: ${statement.substring(0, 50)}...`, error);
                throw error; // Re-throw to indicate a critical setup failure
            }
        }
        console.log("All custom tables created successfully.");
    } else {
        console.log("Custom tables already exist. Skipping creation.");
    }
};


export const getAllProjects = () => {
    const stmt = db.prepare('SELECT * FROM project');
    const allProjects = stmt.all();

    return allProjects.map(row => ({
        projectId: row.project_id,
        projectName: row.project_name,
        artistName: row.artist_name,
        creationDate: row.creation_date,
        videoUrl: row.video_url,
    }))
};

export const createProject = (name, artist, creationDate) => {
    const stmt = db.prepare('INSERT INTO project (project_name, artist_name, creation_date, video_url) VALUES (?, ?, ?, NULL) RETURNING project_id');
    return stmt.run(name, artist, creationDate);
};

export const createRecording = (recordingUuid, userId, projectId, recordingLocation, creationDate) => {
    const stmt = db.prepare('INSERT INTO recording (file_uuid, creator_id, project_id, recording_location, creation_date, last_modified_date) VALUES (?, ?, ?, ?, ?, ?) RETURNING recording_id');
    return stmt.run(recordingUuid, userId, projectId, recordingLocation, creationDate, creationDate);
};

export const getRecordings = (projectId) => {
    console.log("getting recordings for ", projectId)
    const stmt = db.prepare('SELECT * FROM recording WHERE project_id = (?);');
    const recordings = stmt.all(projectId);
    
    return recordings.map(row => ({
        recordingId: row.recording_id,
        recordingUuid: row.file_uuid,
        recordingName: row.recording_name,
        creationDate: row.creation_date,
        recordingLocation: row.recording_location,
    }))
}

export const getUser = (userId) => {
    const stmt = db.prepare('SELECT user_id, user_name, creation_date FROM user WHERE user_id = ?');
    const row = stmt.get(userId);

    if (row) {
        return {
            userId: row.user_id,
            userName: row.user_name,
            creationDate: row.creation_date,
        };
    }
    return null;
};
export const getUsers = () => {
    const stmt = db.prepare('SELECT * FROM user;');
    const row = stmt.all();

    return row.map(row => {
        return {
            userId: row.user_id,
            username: row.user_name,
            creationDate: row.creation_date
        }
    })
};

export const login = (username) => {
    if (doesUserExist(username)) {

        return true;
    }
    return false;
}
export const createAccount = (username) => {
    if (doesUserExist(username)) {
        return false;
    }
    else {
        return true;
    }
}
const doesUserExist = (username) => {
    return true;
}




const initializeDB = () => {
    initializeTables();

    if (!getUsers().length > 0) {

        const createAdminUserStmt = db.prepare(`
            INSERT INTO user (user_id, user_name, creation_date) VALUES (1, ?, ?);
        `)
        createAdminUserStmt.run("user", Date.now());
    }
}
// Immediately call initializeTables when this module is imported.
// This ensures it runs only once when the server starts and the module is first loaded.

initializeDB();