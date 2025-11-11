import { expect } from 'chai';
import sinon from 'sinon';
import { createTodo, deleteTodo, getTodoById, getTodos, updateTodo } from '../controllers/todos.js';


describe('Todo Handlers', () => {
  let env, request;

  beforeEach(() => {

    env = {
      DB: {
        prepare: sinon.stub().returns({
          bind: sinon.stub().returnsThis(),
          all: sinon.stub(),
          first: sinon.stub(),
          run: sinon.stub()
        })
      }
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getTodos', () => {
    it('should return all todos successfully', async () => {
      const mockTodos = {
        results: [
          { id: 1, title: 'Test Todo', description: 'Test', completed: 0 }
        ]
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
      const mockTodo = { id: 1, title: 'Test Todo', description: 'Test', completed: 0 };
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
  });

  describe('createTodo', () => {
    it('should create a new todo successfully', async () => {
      request = {
        json: sinon.stub().resolves({
          title: 'New Todo',
          description: 'Description',
          completed: false
        })
      };

      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ lastInsertRowid: 1 });

      const response = await createTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(201);
      expect(data.success).to.be.true;
      expect(data.todoId).to.equal(1);
    });

    it('should return 400 for validation errors', async () => {
      request = {
        json: sinon.stub().resolves({
          // Missing required 'title' field
          description: 'Description'
        })
      };

      const response = await createTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(400);
      expect(data.error).to.equal('Validation failed');
    });
  });

  describe('updateTodo', () => {
    beforeEach(() => {
      request = {
        params: { id: '1' },
        json: sinon.stub()
      };
    });

    it('should update a todo successfully', async () => {
      request.json.resolves({
        title: 'Updated Todo 1',
        completed: true
      });

      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ changes: 1 });

      const response = await updateTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data.success).to.be.true;
      expect(data.updated).to.be.true;
    });

    it('should return 404 when todo not found', async () => {
      request.json.resolves({
        title: 'Updated Todo'
      });

      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ changes: 0 });

      const response = await updateTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(404);
      expect(data.error).to.equal('Todo not found');
    });

    it('should return 400 when no fields to update', async () => {
      request.json.resolves({});

      const response = await updateTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(400);
      expect(data.error).to.equal('No fields to update');
    });
  });

  describe('deleteTodo', () => {
    beforeEach(() => {
      request = { params: { id: '1' } };
    });

    it('should delete a todo successfully', async () => {
      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ changes: 1 });

      const response = await deleteTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(200);
      expect(data.success).to.be.true;
      expect(data.deleted).to.be.true;
    });

    it('should return 404 when todo not found', async () => {
      env.DB.prepare().bind.returnsThis();
      env.DB.prepare().run.resolves({ changes: 0 });

      const response = await deleteTodo(request, env);
      const data = await response.json();

      expect(response.status).to.equal(404);
      expect(data.error).to.equal('Todo not found');
    });
  });
});