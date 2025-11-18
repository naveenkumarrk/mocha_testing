import { Router } from 'itty-router';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from './handlers/todos.js';

const router = Router();

router.get('/', () => new Response('Todo Worker is running!'));

// Todos routes
router.get('/api/todos', getTodos);
router.get('/api/todos/:id', getTodoById);
router.post('/api/todos', createTodo);
router.put('/api/todos/:id', updateTodo);
router.delete('/api/todos/:id', deleteTodo);

// 404 fallback
router.all('*', () => new Response('Route not found', { status: 404 }));

export default {
  fetch: (req, env, ctx) => router.fetch(req, env, ctx),
};
