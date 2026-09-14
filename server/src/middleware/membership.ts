import { NextFunction, Request, Response } from 'express';
import { db } from '../lib/db';
import { forbidden, notFound, unauthorized } from '../lib/http';
import { parsePublicId } from '../lib/ids';

export async function isMember(userId: number, projectId: number): Promise<boolean> {
  const membership = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return membership !== null;
}

export async function isOwner(userId: number, projectId: number): Promise<boolean> {
  const project = await db.project.findUnique({ where: { id: projectId } });
  return project !== null && project.ownerId === userId;
}

/** Resuelve el projectId relevante para el request, o null si no existe. */
type ProjectIdResolver = (req: Request) => Promise<number | null>;

async function requireMembership(
  req: Request,
  next: NextFunction,
  resolveProjectId: ProjectIdResolver,
  notFoundMessage: string,
): Promise<void> {
  try {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    const projectId = await resolveProjectId(req);
    if (projectId === null) {
      next(notFound(notFoundMessage));
      return;
    }
    if (!(await isMember(req.user.userId, projectId))) {
      next(forbidden('You are not a member of this project'));
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Verifica que el usuario autenticado sea miembro vigente del proyecto
 * indicado en el parámetro de ruta :projectId.
 */
export async function requireProjectMember(req: Request, _res: Response, next: NextFunction): Promise<void> {
  await requireMembership(
    req,
    next,
    async (r) => {
      const projectId = parsePublicId(r.params.projectId, 'proj');
      if (projectId === null) return null;
      const project = await db.project.findUnique({ where: { id: projectId } });
      return project ? projectId : null;
    },
    'Project not found',
  );
}

/** Verifica membresía a partir de una tarea (:taskId). */
export async function requireTaskProjectMember(req: Request, _res: Response, next: NextFunction): Promise<void> {
  await requireMembership(
    req,
    next,
    async (r) => {
      const taskId = parsePublicId(r.params.taskId, 'task');
      if (taskId === null) return null;
      const task = await db.task.findUnique({ where: { id: taskId } });
      return task ? task.projectId : null;
    },
    'Task not found',
  );
}
