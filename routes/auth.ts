import { FastifyPluginAsync } from 'fastify';
import UserModel from '../models/User';
import bcrypt from 'bcryptjs';

const authRoutes: FastifyPluginAsync = async (fastify, options) => {
  
  // Register endpoint supports generic and project-specific users
  fastify.post('/register', async (req: any, reply) => {
    const { username, password, project, adminOnly } = req.body as any;
    if (!username || !password) return reply.code(400).send({ error: 'Missing data' });

    // If trying to create a project-specific or admin-only user, require admin
    if ((project || adminOnly) && (!req.user || !req.user.isAdmin)) {
      return reply.code(403).send({ error: 'Only admin can create project-specific or admin-only users' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    try {
      const newUser = await UserModel.create({ username, passwordHash: hash, project: project || null, adminOnly: !!adminOnly });
      return { id: newUser._id, username: newUser.username, project: newUser.project, adminOnly: newUser.adminOnly };
    } catch (err) {
      return reply.code(409).send({ error: 'User already exists' });
    }
  });

  fastify.post('/login', async (req, reply) => {
    const { username, password } = req.body as any;
    const user = await UserModel.findOne({ username });
    if (!user) return reply.code(401).send({ error: '___Credenciales inválidas' });

    const isValid = await user.comparePassword(password);
    if (!isValid) return reply.code(401).send({ error: 'Credenciales inválidas___' });

    const token = fastify.jwt.sign({ 
      id: user._id, 
      username: user.username 
    });

    return { token, username: user.username, id: user._id };
  });

  fastify.get('/me', {
    onRequest: [async (req) => await req.jwtVerify()]
  }, async (req: any) => {
    return req.user;
  });

  // Delete user endpoint (admin only for project-specific or adminOnly users)
  fastify.delete('/user/:username', {
    onRequest: [async (req: any) => await req.jwtVerify()]
  }, async (req: any, reply) => {
    const { username } = req.params;
    const userToDelete = await UserModel.findOne({ username });
    if (!userToDelete) return reply.code(404).send({ error: 'User not found' });

    // Only admin can delete project-specific or adminOnly users
    if ((userToDelete.project || userToDelete.adminOnly) && (!req.user || !req.user.isAdmin)) {
      return reply.code(403).send({ error: 'Only admin can delete project-specific or admin-only users' });
    }

    // Generic users can self-delete
    if (!userToDelete.project && !userToDelete.adminOnly && req.user.username !== username && !req.user.isAdmin) {
      return reply.code(403).send({ error: 'Not authorized to delete this user' });
    }

    await userToDelete.deleteOne();
    return { success: true };
  });
};

export default authRoutes;