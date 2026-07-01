var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Service } from "@angular/core";
import { ApiNamespace, Scope, AuthBasic, DistributedTable, Realtime } from '@aws-blocks/blocks';
import { z } from 'zod';
/**
 * Backend — aws-blocks/index.ts
 *
 * Real-time todo app with per-user isolation, optimistic locking, and secondary indexes.
 *
 * This file defines your API, auth, data model, and real-time channels.
 * The frontend imports these exports directly via `import { ... } from 'aws-blocks'`.
 *
 * ─── IMPORTANT ───────────────────────────────────────────────────────────────
 * Do NOT use local files, in-memory arrays, or local databases for persistence.
 * Use Building Blocks for cloud persistence and other common cloud abstractions.
 * They work locally with automatic mocks and deploy to AWS with zero configuration.
 *
 * For the full list of blocks and how to use them, see:
 *   node_modules/@aws-blocks/blocks/README.md
 * ─────────────────────────────────────────────────────────────────────────────
 */
let AwsBlocksClient = (() => {
    let _classDecorators = [Service()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AwsBlocksClient = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AwsBlocksClient = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        scope = new Scope('my-todo-app-ng22');
        // ─── Auth ────────────────────────────────────────────────────────────────────
        auth = new AuthBasic(this.scope, 'auth', {
            passwordPolicy: { minLength: 8 },
            crossDomain: process.env.BLOCKS_SANDBOX === 'true',
        });
        authApi = this.auth.createApi();
        // ─── Data ────────────────────────────────────────────────────────────────────
        // Zod schema = runtime validation + TypeScript types + DynamoDB table shape.
        todoSchema = z.object({
            userId: z.string(), // partition key — per-user isolation
            todoId: z.string(), // sort key — unique within a user
            title: z.string(),
            completed: z.boolean(),
            priority: z.number(), // 1=high, 2=medium, 3=low
            version: z.number(), // optimistic locking — incremented on each update
            createdAt: z.number(),
        });
        todos = new DistributedTable(this.scope, 'todos', {
            schema: this.todoSchema,
            key: { partitionKey: 'userId', sortKey: 'todoId' },
            indexes: {
                // Secondary indexes: query todos sorted by priority or title.
                // The partition key is always userId (per-user isolation), the sort key varies.
                byPriority: { partitionKey: 'userId', sortKey: 'priority' },
                byTitle: { partitionKey: 'userId', sortKey: 'title' },
            },
        });
        // ─── Realtime ────────────────────────────────────────────────────────────────
        rt = new Realtime(this.scope, 'live', {
            namespaces: {
                todos: Realtime.namespace(z.object({
                    action: z.enum(['created', 'updated', 'deleted']),
                    todoId: z.string(),
                })),
            },
        });
        // ─── API ─────────────────────────────────────────────────────────────────────
        api = new ApiNamespace(this.scope, 'api', (context) => ({
            async subscribeTodos() {
                const user = await this.auth.requireAuth(context);
                return this.rt.getChannel('todos', user.username);
            },
            async createTodo(title, priority = 2) {
                const user = await this.auth.requireAuth(context);
                const todoId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
                const todo = {
                    userId: user.username,
                    todoId,
                    title,
                    completed: false,
                    priority,
                    version: 1,
                    createdAt: Date.now(),
                };
                await this.todos.put(todo);
                await this.rt.publish('todos', user.username, { action: 'created', todoId });
                return todo;
            },
            /** List todos, optionally sorted by a secondary index. */
            async listTodos(sortBy) {
                const user = await this.auth.requireAuth(context);
                if (sortBy) {
                    const index = sortBy === 'priority' ? 'byPriority' : 'byTitle';
                    return await Array.fromAsync(this.todos.query({ index, where: { userId: { equals: user.username } } }));
                }
                // Default: sorted by todoId (creation order)
                return await Array.fromAsync(this.todos.query({ where: { userId: { equals: user.username } } }));
            },
            /**
             * Toggle todo completion with optimistic locking.
             * Uses `ifFieldEquals` to detect concurrent writes. On conflict,
             * throws ConditionalCheckFailedException — caller should re-read and retry.
             */
            async toggleTodo(todoId) {
                const user = await this.auth.requireAuth(context);
                const todo = await this.todos.get({ userId: user.username, todoId });
                if (!todo)
                    throw new Error('Todo not found');
                await this.todos.put({ ...todo, completed: !todo.completed, version: todo.version + 1 }, { ifFieldEquals: { version: todo.version } });
                await this.rt.publish('todos', user.username, { action: 'updated', todoId });
                return { success: true };
            },
            /** Update a todo's priority with optimistic locking. */
            async updatePriority(todoId, priority) {
                const user = await this.auth.requireAuth(context);
                const todo = await this.todos.get({ userId: user.username, todoId });
                if (!todo)
                    throw new Error('Todo not found');
                await this.todos.put({ ...todo, priority, version: todo.version + 1 }, { ifFieldEquals: { version: todo.version } });
                await this.publish('todos', user.username, { action: 'updated', todoId });
                return { success: true };
            },
            /** Delete a todo. Broadcasts 'deleted' to all connected clients. */
            async deleteTodo(todoId) {
                const user = await this.auth.requireAuth(context);
                await this.this.todos.delete({ userId: user.username, todoId });
                await this.rt.publish('todos', user.username, { action: 'deleted', todoId });
                return { success: true };
            },
        }));
    };
    return AwsBlocksClient = _classThis;
})();
export { AwsBlocksClient };
