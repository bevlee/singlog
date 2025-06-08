import Database from 'better-sqlite3';
import path from 'path'; // Import path module for robust path handling
import { fileURLToPath } from 'url'; // For ES Modules to get __dirname equivalent

// Get the directory name of the current module, equivalent to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the database path relative to your project root or a data directory
// Using path.resolve ensures the path is absolute and correct regardless of where the script is run from.
const dbPath = path.resolve(__dirname, '../../../singlog.db'); // Adjust path as needed for your project structure

// Initialize the database connection. This happens only once when the module is first imported.
const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Set WAL mode for better concurrency and data integrity

// Define your table creation SQL
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
    CREATE TABLE IF NOT EXISTS recordings ( 
        recording_id INTEGER PRIMARY KEY AUTOINCREMENT,
        recording_location TEXT NOT NULL,
        creation_date INTEGER NOT NULL,
        last_modified_date INTEGER NOT NULL,
        project_id INTEGER NOT NULL,
        creator_id INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES project(project_id),
        FOREIGN KEY (creator_id) REFERENCES user(user_id)
    );
`;

// Array of table creation statements
const initTableStatements = [ // Renamed for clarity
    createProjectTable,
    createUserTable,
    createRecordingsTable,
];

// Function to initialize tables
const initializeTables = () => { // Renamed from initDB to initializeTables for clarity
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

// Immediately call initializeTables when this module is imported.
// This ensures it runs only once when the server starts and the module is first loaded.
initializeTables();

// Export the database instance and any helper functions
export { db };

// You can also add helper functions to wrap common operations:
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

// Example: getUser function
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
    return null; // Or throw an error, depending on your error handling
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