import { Router } from 'itty-router';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from './handlers/todos.js';

const router = Router();

router.get('/health', () => new Response('Todo Worker is running!'));

router.get(
  '/random',
  () => new Response('random number is: ', Math.random().toString())
);
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
