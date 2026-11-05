import { Server } from 'http';
import { AddressInfo } from 'net';
import path from 'path';
import { Verifier } from '@pact-foundation/pact';
import { createApp } from '../../src/app';
import { db } from '../../src/lib/db';
import { signToken } from '../../src/middleware/auth';
let server: Server;
let baseUrl: string;
let token = '';
beforeAll(async () => {
    // La API real, en un puerto libre y con la base temporal de tests/setup.ts
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});
afterAll(() => {
    server.close();
});
describe('Verificación del provider: TaskFlowAPI', () => {
    it('cumple el contrato con TaskFlowWeb', async () => {
        await new Verifier({
            provider: 'TaskFlowAPI',
            providerBaseUrl: baseUrl,
            pactUrls: [path.resolve(process.cwd(), 'pacts/TaskFlowWeb-TaskFlowAPI.json')],
            // Cambia el token falso del contrato por uno real (solo si la request trae token)
            requestFilter: (req, _res, next) => {
                if (req.headers['authorization']) {
                    req.headers['authorization'] = `Bearer ${token}`;
                }
                next();
            },
            // Prepara los datos de cada "given" del consumer
            stateHandlers: {
                'ana tiene un proyecto': async () => {
                    const ana = await db.user.create({
                        data: {
                            email: `ana-${Date.now()}@test.com`, name: 'Ana',
                            passwordHash: 'x'
                        },
                    });
                    const project = await db.project.create({
                        data: {
                            name: 'Rediseño del sitio',
                            description: 'Renovación completa del sitio',
                            ownerId: ana.id,
                        },
                    });
                    await db.projectMember.create({
                        data: { projectId: project.id, userId: ana.id, role: 'OWNER' },
                    });
                    token = signToken({ userId: ana.id, email: ana.email });
                },
            },
        }).verifyProvider();
    });
});