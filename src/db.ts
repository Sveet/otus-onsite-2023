import { Database } from 'bun:sqlite';
import { StageData, User } from './types';

const db = new Database('otus-onsite-2023.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    stage INTEGER NOT NULL DEFAULT 0,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    data TEXT
  );
`);

export function getUser(id: string): User | undefined {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  const user = stmt.get(id) as any;
  if (user) {
    return new User(user);
  }
  return undefined;
}

export function getAllUsers(): User[] {
  const stmt = db.prepare("SELECT * FROM users");
  const users = stmt.all() as any[];
  return users.map(user => new User(user));
}

export function createUser(user: Omit<User, 'created' | 'updated'>): void {
  const stmt = db.prepare("INSERT INTO users (id, stage, data) VALUES (?, ?, ?)");
  stmt.run(user.id, user.stage, serializeMap(user.data));
}

export function updateUser(user: User): void {
  const stmt = db.prepare("UPDATE users SET stage = ?, data = ?, updated = CURRENT_TIMESTAMP WHERE id = ?");
  stmt.run(user.stage, serializeMap(user.data), user.id);
}

export function upsertUser(user: User): void {
  user.created ??= new Date();
  user.updated ??= new Date();
  const stmt = db.prepare(`
    INSERT INTO users (id, stage, data) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET stage = excluded.stage, data = excluded.data, updated = CURRENT_TIMESTAMP
  `);
  stmt.run(user.id, user.stage, serializeMap(user.data));
}


export function deleteUser(id: string): void {
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  stmt.run(id);
}


export const serializeMap = (data: Map<string, StageData>) => JSON.stringify(Array.from(data.entries()));
export const deserializeMap = (data: string) => new Map<string, StageData>(JSON.parse(data));