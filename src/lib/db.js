import Database from 'better-sqlite3';
const db = new Database('foobar.db');
db.pragma('journal_mode = WAL');

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