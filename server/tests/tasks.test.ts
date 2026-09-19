import request from 'supertest';
import { app, auth, createProject, registerUser } from './helpers';

describe('Tareas', () => {
  it('crea una tarea en un proyecto', async () => {
    const { token } = await registerUser('task1@test.com');
    const project = await createProject(token, 'Proyecto de tareas');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'Implementar login', priority: 'HIGH', description: 'Crear flujo de login' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        projectId: project.id,
        title: 'Implementar login',
        description: 'Crear flujo de login',
        status: 'TODO',
        priority: 'HIGH',
      }),
    );
  });

  it('rechaza una tarea sin título', async () => {
    const { token } = await registerUser('task-title-required@test.com');
    const project = await createProject(token, 'Proyecto de validación');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({priority: 'HIGH', description: 'Crear flujo de login' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('title is required');
  });

  it('rechaza un título con menos de 3 caracteres', async () => {
    const { token } = await registerUser('task-title-short@test.com');
    const project = await createProject(token, 'Proyecto de validación');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'ab'});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('title must be between 3 and 200 characters');
  });

  it('acepta un título de exactamente 3 caracteres', async () => {
    const { token } = await registerUser('task-title-minimum@test.com');
    const project = await createProject(token, 'Proyecto de validación');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'abc'});

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('abc');
  });

  it('acepta un título de exactamente 200 caracteres', async () => {
    const { token } = await registerUser('task-title-maximum@test.com');
    const project = await createProject(token, 'Proyecto de validación');
    const title = 'a'.repeat(200);

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(title);
  });

  it('rechaza un título con más de 200 caracteres', async () => {
    const { token } = await registerUser('task-title-long@test.com');
    const project = await createProject(token, 'Proyecto de validación');
    const title = 'a'.repeat(201);

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('title must be between 3 and 200 characters');
  });

  it('crea una tarea en un proyecto con prioridad invalida', async () => {
    const { token } = await registerUser('task2@test.com');
    const project = await createProject(token, 'Proyecto de tareas');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'Implementar login', priority: 'Prioridad invalida', description: 'Crear flujo de login' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Priority must be one of');
  });

  it('crea una tarea en un proyecto algun parametro nulo', async () => {
    const { token } = await registerUser('task3@test.com');
    const project = await createProject(token, 'Proyecto de tareas');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'Implementar login', priority: 'Prioridad invalida', description: null });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('Priority must be one of');
  });

  it('crea una tarea en proyecto inexistente', async () => {
    const { token } = await registerUser('task4@test.com');

    const res = await request(app)
      .post(`/api/projects/9999/tasks`)
      .set(auth(token))
      .send({ title: 'Implementar login', priority: 'HIGH', description: 'Crear flujo de login' });
    
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('Project not found');
  });

  it('avanza una tarea de TODO a IN_PROGRESS', async () => {
    const { token, id } = await registerUser('task5@test.com');
    const project = await createProject(token, 'Proyecto de estados');
    const task = (
      await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .set(auth(token))
        .send({ title: 'Tarea con estados', assigneeId: id })
    ).body;

    const res = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .set(auth(token))
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('filtra las tareas por estado', async () => {
    const { token } = await registerUser('task6@test.com');
    const project = await createProject(token, 'Proyecto de filtros');
    await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'Primera tarea' });
    await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'Segunda tarea' });

    const res = await request(app)
      .get(`/api/projects/${project.id}/tasks?status=TODO`)
      .set(auth(token));

    expect(res.body.items).toHaveLength(2);
  });

  it('validar que las tareas se creen con status TODO', async () => {
    const { token } = await registerUser('task-status-done@test.com');
    const project = await createProject(token, 'Proyecto de estados');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'Tarea creada como DONE', status: 'DONE' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('TODO');
  });

  it('crea una tarea asignada a un usuario existente', async () => {
    const { token, id } = await registerUser('task-assignee-existing@test.com');
    const project = await createProject(token, 'Proyecto de asignaciones');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'Tarea con responsable', assigneeId: id });

    expect(res.status).toBe(201);
    expect(res.body.assigneeId).toBe(id);
  });

  it('rechaza una tarea asignada a un usuario inexistente', async () => {
    const { token } = await registerUser('task-assignee-missing@test.com');
    const project = await createProject(token, 'Proyecto de asignaciones');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(token))
      .send({ title: 'Tarea con responsable', assigneeId: '999999' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('The assignee must be a member of the project');
  });

  it('rechaza crear una tarea si el usuario no es miembro del proyecto', async () => {
    const { token: ownerToken } = await registerUser('task-project-owner@test.com');
    const { token: nonMemberToken } = await registerUser('task-project-non-member@test.com');
    const project = await createProject(ownerToken, 'Proyecto privado');

    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set(auth(nonMemberToken))
      .send({ title: 'Tarea de usuario externo' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body.error.message).toBe('You are not a member of this project');
  });

});
