import { Database } from 'bun:sqlite';
import { User } from './types';

const db = new Database('otus-onsite-2023.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    stage INTEGER NOT NULL DEFAULT 0,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export function getUser(id: string): User | undefined {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  const user = stmt.get(id) as User;
  if (user) {
    return {
      id: user.id,
      stage: user.stage,
      created: new Date(user.created!),
      updated: new Date(user.updated!),
    };
  }
  return undefined;
}

export function getAllUsers(): User[] {
  const stmt = db.prepare("SELECT * FROM users");
  const users = stmt.all() as User[];
  return users.map(user => ({
    id: user.id,
    stage: user.stage,
    created: new Date(user.created!),
    updated: new Date(user.updated!),
  }));
}

export function createUser(user: Omit<User, 'created' | 'updated'>): void {
  const stmt = db.prepare("INSERT INTO users (id, stage) VALUES (?, ?)");
  stmt.run(user.id, user.stage);
}

export function updateUser(user: User): void {
  const stmt = db.prepare("UPDATE users SET stage = ?, updated = CURRENT_TIMESTAMP WHERE id = ?");
  stmt.run(user.stage, user.id);
}

export function upsertUser(user: User): void {
  user.created ??= new Date();
  user.updated ??= new Date();
  const stmt = db.prepare(`
      INSERT INTO users (id, stage, created, updated) VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET stage = excluded.stage, updated = CURRENT_TIMESTAMP
  `);
  stmt.run(user.id, user.stage, user.created.toISOString(), user.updated.toISOString());
}


export function deleteUser(id: string): void {
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  stmt.run(id);
}
