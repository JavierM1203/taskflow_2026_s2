import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const serverDir = path.resolve(process.cwd(), 'server');
const databasePath = path.join(serverDir, 'prisma', 'e2e.db');

export default function globalSetup(): void {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    fs.rmSync(`${databasePath}${suffix}`, { force: true });
  }

  execSync('npm exec -- prisma db push --schema prisma/schema.prisma --skip-generate --accept-data-loss', {
    cwd: serverDir,
    env: { ...process.env, DATABASE_URL: 'file:./e2e.db' },
    stdio: 'inherit',
  });
}
