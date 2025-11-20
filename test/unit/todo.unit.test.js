import { expect } from 'chai';
import sinon from 'sinon';
import {
  createTodo,
  getTodoById,
  getTodos,
  updateTodo,
} from '../../handlers/todos.js';
import * as validation from '../../utils/validation.js';

describe('Todo Handlers', () => {
  let env, request, validateStub;

  beforeEach(() => {
    env = {
      DB: {
        prepare: sinon.stub().returns({
          bind: sinon.stub().returnsThis(),
          all: sinon.stub(),
          first: sinon.stub(),
          run: sinon.stub(),
        }),
      },
    };

    validateStub = sinon.stub(validation.updateTodoSchema, 'validate');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getTodos', () => {
    it('should return all todos successfully', async () => {
      const mockTodos = {
        results: [
          { id: 1, title: 'Test Todo', description: 'Test', completed: 0 },
        ],
      };

      env.DB.prepare().all.resolves(mockTodos);

      const response = await getTodos(request, env);
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data.results).to.be.an('array');
      expect(data.results).to.have.lengthOf(1);
    });

    it('should handle database errors', async () => {
      env.DB.prepare().all.rejects(new Error('Database error'));

      const response = await getTodos(request, env);
      const data = await response.json();

      expect(response.status).to.equal(500);
      expect(data.error).to.equal('Failed to get todos');
    });
  });

  describe('getTodoById', () => {
    beforeEach(() => {
      request = { params: { id: '1' } };
    });

    it('should return a todo by id', async () => {
      const mockTodo = {
        id: 1,
        title: 'Test Todo',
        description: 'Test',
        completed: 0,
      };
      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().first.resolves(mockTodo);

      const response = await getTodoById(request, env);
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data.success).to.be.true;
      expect(data.todo.id).to.equal(1);
    });

    it('should return 404 when todo not found', async () => {
      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().first.resolves(null);

      const response = await getTodoById(request, env);
      const data = await response.json();

      expect(response.status).to.equal(404);
      expect(data.error).to.equal('Todo not found');
    });

    it('should return - Failed to get todo', async () => {
      env.DB.prepare().bind.rejects(new Error('Database error'));

      const response = await getTodoById(request, env);
      const data = await response.json();

      expect(response.status).to.equal(500);
      expect(data.error).to.equal('Failed to get todo');
    });
  });

  describe('createTodo', () => {
    it('should create a new todo  as false', async () => {
      request = {
        json: sinon.stub().resolves({
          title: 'New Todo',
          description: 'Description',
          completed: false,
        }),
      };

      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ lastInsertRowid: 1 });

      const response = await createTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(201);
      expect(data.success).to.be.true;
    });

    it('should create a new todo completed as true', async () => {
      request = {
        json: sinon.stub().resolves({
          title: 'New Todo (Done)',
          description: 'Description',
          completed: true,
        }),
      };

      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ lastInsertRowid: 1 });

      const response = await createTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(201);
      expect(data.success).to.be.true;
    });

    it('should return 400 for validation errors', async () => {
      request = {
        json: sinon.stub().resolves({
          // Missing required 'title' field
          description: 'Description',
        }),
      };

      const response = await createTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(400);
      expect(data.error).to.equal('Validation failed');
    });

    it('should return Failed to create a todo task', async () => {
      const request = { json: sinon.stub().resolves({ title: 'Title' }) };
      env.DB.prepare().bind.rejects(new Error('DB error'));

      const response = await createTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(500);
      expect(data.error).to.equal('Failed to create todo');
    });
  });

  describe('updateTodo', () => {
    beforeEach(() => {
      request = {
        params: { id: '1' },
        json: sinon.stub(),
      };
    });

    it('should update a todo successfully', async () => {
      request.json.resolves({
        title: 'Updated Todo 1',
        description: ' updated desctription',
        completed: true,
      });

      validateStub.returns({
        error: null,
        value: {
          title: 'Updated Todo',
          description: ' updated desctription',
          completed: true,
        },
      });

      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ changes: 1 });
      const response = await updateTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data.success).to.be.true;
      expect(data.updated).to.be.true;
    });

    // it('should update the completed todos for False', async () => {
    //   request.json.resolves({
    //     completed: false,
    //   });

    //   validateStub.returns({ error: null, value: { completed: false } });
    //   env.DB.prepare().bind.returnsThis();
    //   env.DB.prepare().run.resolves({ changes: 1 });

    //   const response = await updateTodo(request, env);
    //   const data = await response.json();

    //   expect(response.status).to.equal(200);
    //   expect(data.success).to.be.true;
    //   expect(data.updated).to.be.true;
    // });

    // it('should return 400 - Validation errors', async () => {
    //   const request = {
    //     params: 125,
    //     json: sinon.stub().resolves({ title: ' ' }),
    //   };

    //   validateStub.returns({
    //     error: { message: 'Title is requried' },
    //     value: null,
    //   });

    //   const response = await updateTodo(request, env);
    //   const data = await response.json();

    //   expect(response.status).to.equal(400);
    //   expect(data.error).to.equal('Validation failed');
    // });

    it('should return 404 when todo not found', async () => {
      request.json.resolves({
        title: 'Updated Todo',
      });
      validateStub.returns({ error: null, value: { title: 'Updated Todo' } });

      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ changes: 0 });

      const response = await updateTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(404);
      expect(data.error).to.equal('Todo not found');
    });

    it('should return 400 when no fields to update', async () => {
      request.json.resolves({});
      validateStub.returns({ error: null, value: {} });

      const response = await updateTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(400);
      expect(data.error).to.equal('No fields to update');
    });

    it('should return - Failed to get todo', async () => {
      env.DB.prepare().bind.rejects(new Error('Database error'));

      const response = await updateTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(500);
      expect(data.error).to.equal('Failed to update todo');
    });
  });

  // describe('deleteTodo', () => {
  //   beforeEach(() => {
  //     request = { params: { id: '1' } };
  //   });

  //   it('should delete a todo successfully', async () => {
  //     env.DB.prepare().bind.returnsThis();
  //     env.DB.prepare().run.resolves({ changes: 1 });

  //     const response = await deleteTodo(request, env);
  //     const data = await response.json();

  //     expect(response.status).to.equal(200);
  //     expect(data.success).to.be.true;
  //     expect(data.deleted).to.be.true;
  //   });

  //   it('should return 404 when todo not found', async () => {
  //     env.DB.prepare().bind.returnsThis();
  //     env.DB.prepare().run.resolves({ changes: 0 });

  //     const response = await deleteTodo(request, env);
  //     const data = await response.json();

  //     expect(response.status).to.equal(404);
  //     expect(data.error).to.equal('Todo not found');
  //   });

  //   it('should return - Failed to get todo', async () => {
  //     env.DB.prepare().bind.rejects(new Error('Database error'));

  //     const response = await deleteTodo(request, env);
  //     const data = await response.json();

  //     expect(response.status).to.equal(500);
  //     expect(data.error).to.equal('Failed to delete todo');
  //   });
  // });

  describe('getTodos', () => {
    it('should return empty array when no todos exist', async () => {
      env.DB.prepare().all.resolves({ results: [] });

      const response = await getTodos(request, env);
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data.todos).to.be.an('array').that.is.empty;
    });

    it('should return failed to fetch', async () => {
      env.DB.prepare().all.rejects(new Error('Database error'));

      const response = await getTodos(request, env);
      const data = await response.json();

      expect(response.status).to.equal(500);
      expect(data.error).to.equal('Failed to fetch todos');
      expect(data.details).to.equal('Database error');
    });

    it('should return Todo not found', async () => {
      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().first.resolves(null);

      const response = await getTodoById(request, env);
      const data = await response.json();

      expect(response.status).to.equal(404);
      expect(data.error).to.equal('Todo not found');
    });

    // it('should return all the todos with correct structure', async () => {
    //   const mockTodos = {
    //     results: [
    //       { id: 1, title: 'Test Todo 1', description: 'Test 1', completed: 0 },
    //       { id: 2, title: 'Test Todo 2', description: 'Test 2', completed: 1 },
    //     ],
    //   };

    //   env.DB.prepare().all.resolves(mockTodos);

    //   const response = await getTodos(request, env);
    //   const data = await response.json();

    //   expect(response.status).to.equal(200);
    //   expect(data.todos).to.be.an('array').with.lengthOf(2);

    //   data.todos.forEach((todo, index) => {
    //     expect(todo).to.have.all.keys(
    //       'id',
    //       'title',
    //       'description',
    //       'completed'
    //     );
    //     expect(todo).to.deep.equal(mockTodos.results[index]);
    //   });
    // });

    // it('should return the specific todo by id', async () => {
    //   const mockTodo = {
    //     id: 2,
    //     title: 'Test Todo 2',
    //     description: 'Test 2',
    //     completed: 1,
    //   };

    //   const stmt = {
    //     bind: sinon.stub().returnsThis(),
    //     first: sinon.stub().resolves(mockTodo),
    //   };

    //   env.DB.prepare.returns(stmt);

    //   request = { params: { id: '2' } };

    //   const response = await getTodoById(request, env);
    //   const data = await response.json();

    //   expect(response.status).to.equal(200);
    //   expect(data.success).to.be.true;
    //   expect(data.todo).to.deep.equal(mockTodo);
    // });
  });
});
