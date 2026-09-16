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

  it('crea una tarea en un proyecto con valor invalido', async () => {
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
});
