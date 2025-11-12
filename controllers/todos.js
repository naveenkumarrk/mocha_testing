import { createTodoSchema, updateTodoSchema } from "../utils/validation.js";   


export async function getTodos(request, env) {
    try{
        const todos = await env.DB.prepare('SELECT * FROM todos').all()
        // const responseBody = JSON.stringify(todos);
        return new Response(JSON.stringify(todos),{ status:200,headers: { 'Content-Type': 'application/json' } })
    }catch(error){
        return new Response(JSON.stringify({error: "Failed to get todos", details: error.message}),{
            status:500,
            headers:{'Content-Type': 'application/json'}
        })
    }
}

export async function getTodoById(request, env) {
  try {
    const id = request.params.id;
    const result = await env.DB.prepare('SELECT * FROM todos WHERE id = ?').bind(id).first();

    if (!result) {
      return new Response(JSON.stringify({ error: "Todo not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, todo: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to get todo", details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function createTodo(request, env) {
  try {
    const body = await request.json();

    const { error, value } = createTodoSchema.validate(body);
    if (error) {
      return new Response(JSON.stringify({ error: "Validation failed", details: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { title, description, completed } = value;
    const result = await env.DB.prepare('INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)').bind(
      title,
      description || "",
      completed ? 1: 0
    ).run();

    return new Response(JSON.stringify({ success: true, todoId: result.lastInsertRowid }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create todo", details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function updateTodo(request, env) {
  try {
    const id = request.params.id;
    const body = await request.json();
    const { error, value } = updateTodoSchema.validate(body);
    
    if (error) {
      return new Response(JSON.stringify({ error: "Validation failed", details: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
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
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const sql = `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`;
    const result = await env.DB.prepare(sql).bind(...params).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Todo not found" }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ success: true, updated: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update todo", details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function deleteTodo(request, env) {
  try {
    const id = request.params.id;

    const result = await env.DB.prepare('DELETE FROM todos WHERE id = ?').bind(id).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: "Todo not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, deleted: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete todo", details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}