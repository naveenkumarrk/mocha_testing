import { createTodoSchema, updateTodoSchema } from '../utils/validation.js';
import { jsonResponse } from '../utils/helpers.js';

export async function getTodos(request, env) {
  try {
    const todos = await env.DB.prepare('SELECT * FROM todos').all();
    // const responseBody = JSON.stringify(todos);
    return jsonResponse({ success: true, todos: todos.results });
  } catch (error) {
    return jsonResponse(
      { error: 'Failed to fetch todos', details: error.message },
      500
    );
  }
}

export async function getTodoById(request, env) {
  try {
    const id = request.params.id;
    const result = await env.DB.prepare('SELECT * FROM todos WHERE id = ?')
      .bind(id)
      .first();

    if (!result) {
      return jsonResponse({ error: 'Todo not found' }, 404);
    }

    return jsonResponse({ success: true, todo: result });
  } catch (error) {
    return jsonResponse(
      { error: 'Failed to fetch todo', details: error.message },
      500
    );
  }
}

export async function createTodo(request, env) {
  try {
    const body = await request.json();

    const { error, value } = createTodoSchema.validate(body);
    if (error) {
      return jsonResponse(
        { error: 'Validation failed', details: error.message },
        400
      );
    }

    const { title, description, completed } = value;
    const result = await env.DB.prepare(
      'INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)'
    )
      .bind(title, description || '', completed ? 1 : 0)
      .run();

    return jsonResponse({ success: true, todoId: result.lastInsertRowid }, 201);
  } catch (error) {
    return jsonResponse(
      { error: 'Failed to create todo', details: error.message },
      500
    );
  }
}

export async function updateTodo(request, env) {
  try {
    const id = request.params.id;
    const body = await request.json();
    const { error, value } = updateTodoSchema.validate(body);

    if (error) {
      return jsonResponse(
        { error: 'Validation failed', details: error.message },
        400
      );
    }

    const { title, description, completed } = value;

    // Build dynamic SQL query based on provided fields
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (completed !== undefined) {
      updates.push('completed = ?');
      params.push(completed ? 1 : 0);
    }

    if (updates.length === 0) {
      return jsonResponse({ error: 'No fields to update' }, 400);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const sql = `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`;
    const result = await env.DB.prepare(sql)
      .bind(...params)
      .run();

    if (result.changes === 0) {
      return jsonResponse({ error: 'Todo not found' }, 404);
    }

    return jsonResponse({ success: true, updated: true });
  } catch (error) {
    return jsonResponse(
      { error: 'Failed to update todo', details: error.message },
      500
    );
  }
}

export async function deleteTodo(request, env) {
  try {
    const id = request.params.id;

    const result = await env.DB.prepare('DELETE FROM todos WHERE id = ?')
      .bind(id)
      .run();

    if (result.changes === 0) {
      return jsonResponse({ error: 'Todo not found' }, 404);
    }

    return jsonResponse({ success: true, deleted: true });
  } catch (error) {
    return jsonResponse(
      { error: 'Failed to delete todo', details: error.message },
      500
    );
  }
}
