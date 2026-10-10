import request from 'supertest';
import { app, auth, createProject, registerUser } from './helpers';

describe('Proyectos', () => {
  it('crea un proyecto', async () => {
    const { token } = await registerUser('proj1@test.com');

    const res = await request(app)
      .post('/api/projects')
      .set(auth(token))
      .send({ name: 'Mi Proyecto', description: 'Descripción' });

    expect(res.status).toBe(201);
  });

  it('lista los proyectos del usuario', async () => {
    const { token } = await registerUser('proj2@test.com');
    await createProject(token, 'Proyecto A');
    await createProject(token, 'Proyecto B');

    const res = await request(app).get('/api/projects').set(auth(token));

    expect(res.body).toHaveLength(2);
  });

  it('rechaza crear un proyecto sin autenticación', async () => {
    const res = await request(app).post('/api/projects').send({ name: 'Sin token' });

    expect(res.status).toBe(401);
  });

  it('rechaza nombres demasiado largos, descripciones inválidas y nombres duplicados', async () => {
    const { token } = await registerUser('proj-validation@test.com');

    const longName = await request(app)
      .post('/api/projects')
      .set(auth(token))
      .send({ name: 'a'.repeat(101) });
    expect(longName.status).toBe(400);

    const invalidDescription = await request(app)
      .post('/api/projects')
      .set(auth(token))
      .send({ name: 'Proyecto válido', description: 123 });
    expect(invalidDescription.status).toBe(400);

    const longDescription = await request(app)
      .post('/api/projects')
      .set(auth(token))
      .send({ name: 'Proyecto válido', description: 'a'.repeat(501) });
    expect(longDescription.status).toBe(400);

    const first = await request(app)
      .post('/api/projects')
      .set(auth(token))
      .send({ name: 'Duplicado' });
    expect(first.status).toBe(201);

    const duplicate = await request(app)
      .post('/api/projects')
      .set(auth(token))
      .send({ name: 'Duplicado' });
    expect(duplicate.status).toBe(409);
  });

  it('incluye proyectos compartidos en la lista de miembros y los oculta a otros usuarios', async () => {
    const { token: ownerToken } = await registerUser('proj-list-owner@test.com');
    const { token: memberToken } = await registerUser('proj-list-member@test.com');
    const { token: outsiderToken } = await registerUser('proj-list-outsider@test.com');
    const project = await createProject(ownerToken, 'Compartido');

    const addedMember = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set(auth(ownerToken))
      .send({ email: 'proj-list-member@test.com' });
    expect(addedMember.status).toBe(201);

    const memberProjects = await request(app).get('/api/projects').set(auth(memberToken));
    const outsiderProjects = await request(app).get('/api/projects').set(auth(outsiderToken));

    expect(memberProjects.body.map((item: { id: string }) => item.id)).toContain(project.id);
    expect(outsiderProjects.body).toHaveLength(0);
  });

  it('actualiza proyectos y valida identificadores, nombres y descripciones', async () => {
    const { token } = await registerUser('proj-update@test.com');
    const project = await createProject(token, 'Original');
    const secondProject = await createProject(token, 'Otro proyecto');

    const updated = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(auth(token))
      .send({ name: '  Nuevo nombre  ', description: null });
    expect(updated.status).toBe(200);
    expect(updated.body).toEqual(
      expect.objectContaining({ name: 'Nuevo nombre', description: null }),
    );

    const invalidId = await request(app)
      .patch('/api/projects/not-a-project')
      .set(auth(token))
      .send({ name: 'Nombre válido' });
    expect(invalidId.status).toBe(404);

    const shortName = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(auth(token))
      .send({ name: 'ab' });
    expect(shortName.status).toBe(400);

    const longName = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(auth(token))
      .send({ name: 'a'.repeat(101) });
    expect(longName.status).toBe(400);

    const duplicateName = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(auth(token))
      .send({ name: 'Otro proyecto' });
    expect(duplicateName.status).toBe(409);

    const invalidDescription = await request(app)
      .patch(`/api/projects/${secondProject.id}`)
      .set(auth(token))
      .send({ description: 123 });
    expect(invalidDescription.status).toBe(400);
  });

  it('distingue miembros y usuarios ajenos al autorizar cambios', async () => {
    const { token: ownerToken } = await registerUser('proj-access-owner@test.com');
    const { token: memberToken } = await registerUser('proj-access-member@test.com');
    const { token: outsiderToken } = await registerUser('proj-access-outsider@test.com');
    const project = await createProject(ownerToken, 'Proyecto protegido');

    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set(auth(ownerToken))
      .send({ email: 'proj-access-member@test.com' });

    const memberUpdate = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(auth(memberToken))
      .send({ name: 'No autorizado' });
    expect(memberUpdate.status).toBe(403);

    const outsiderUpdate = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set(auth(outsiderToken))
      .send({ name: 'No visible' });
    expect(outsiderUpdate.status).toBe(404);
  });

  it('agrega miembros y rechaza emails inválidos, usuarios inexistentes y miembros duplicados', async () => {
    const { token: ownerToken } = await registerUser('proj-members-owner@test.com');
    await registerUser('proj-members-user@test.com');
    const project = await createProject(ownerToken, 'Proyecto con miembros');

    const invalidProject = await request(app)
      .post('/api/projects/not-a-project/members')
      .set(auth(ownerToken))
      .send({ email: 'proj-members-user@test.com' });
    expect(invalidProject.status).toBe(404);

    const invalidEmail = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set(auth(ownerToken))
      .send({ email: 'no-es-un-email' });
    expect(invalidEmail.status).toBe(400);

    const missingUser = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set(auth(ownerToken))
      .send({ email: 'missing-project-user@test.com' });
    expect(missingUser.status).toBe(404);

    const added = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set(auth(ownerToken))
      .send({ email: '  PROJ-MEMBERS-USER@TEST.COM  ' });
    expect(added.status).toBe(201);
    expect(added.body).toEqual(
      expect.objectContaining({ email: 'proj-members-user@test.com', role: 'MEMBER' }),
    );

    const duplicate = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set(auth(ownerToken))
      .send({ email: 'proj-members-user@test.com' });
    expect(duplicate.status).toBe(409);
  });

  it('elimina miembros y protege al dueño y los permisos del proyecto', async () => {
    const { token: ownerToken, id: ownerId } = await registerUser('proj-remove-owner@test.com');
    const { token: memberToken, id: memberId } = await registerUser('proj-remove-member@test.com');
    const { token: outsiderToken } = await registerUser('proj-remove-outsider@test.com');
    const project = await createProject(ownerToken, 'Proyecto para eliminar miembros');

    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set(auth(ownerToken))
      .send({ email: 'proj-remove-member@test.com' });

    const invalidIds = await request(app)
      .delete(`/api/projects/${project.id}/members/not-a-user`)
      .set(auth(ownerToken));
    expect(invalidIds.status).toBe(404);

    const removeOwner = await request(app)
      .delete(`/api/projects/${project.id}/members/${ownerId}`)
      .set(auth(ownerToken));
    expect(removeOwner.status).toBe(400);

    const removeMissingMember = await request(app)
      .delete(`/api/projects/${project.id}/members/user-999999`)
      .set(auth(ownerToken));
    expect(removeMissingMember.status).toBe(404);

    const denied = await request(app)
      .delete(`/api/projects/${project.id}/members/${memberId}`)
      .set(auth(memberToken));
    expect(denied.status).toBe(403);

    const removed = await request(app)
      .delete(`/api/projects/${project.id}/members/${memberId}`)
      .set(auth(ownerToken));
    expect(removed.status).toBe(204);

    const outsiderRemove = await request(app)
      .delete(`/api/projects/${project.id}/members/${memberId}`)
      .set(auth(outsiderToken));
    expect(outsiderRemove.status).toBe(403);
  });

  it('elimina proyectos y devuelve 404 para identificadores inválidos o inexistentes', async () => {
    const { token } = await registerUser('proj-delete@test.com');

    const invalidId = await request(app).delete('/api/projects/no-es-proyecto').set(auth(token));
    expect(invalidId.status).toBe(404);

    const missingProject = await request(app).delete('/api/projects/proj-999999').set(auth(token));
    expect(missingProject.status).toBe(404);

    const project = await createProject(token, 'Proyecto eliminable');
    const deleted = await request(app)
      .delete(`/api/projects/${project.id}`)
      .set(auth(token));
    expect(deleted.status).toBe(204);
  });
});
