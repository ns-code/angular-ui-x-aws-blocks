import { Service } from "@angular/core";
import { authApi, api } from 'aws-blocks';
import { AuthUser } from "@aws-blocks/blocks";

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
export interface Todo {
    userId: string;
    todoId: string;
    title: string;
    completed: boolean;
    priority: number;
    version: number;
    createdAt: number;
}

@Service()
export class AwsBlocksClient {

    public async getLoginUser(): Promise<AuthUser | null> {
        try {
            const authState = await authApi.getAuthState();

            if (!authState.user) {
                throw new Error(">> authState undefined, unknown user");
            }

            return authState.user;
        } catch (err) {
            console.log(">> err: ", err);
            return null;
        } finally {
            console.log("Operation cleaned up."); // Runs regardless of outcome
        }
    }

    public async login(username: string, passwd: string) {
        return await authApi.setAuthState({
            action: 'signIn',
            username: username,
            password: passwd,
        });
    }

    public async logout() {
        // api.signOut();
        return await authApi.setAuthState({
            action: 'signOut'
        });        
    }    

    public async register(username: string, passwd: string) {
        return await authApi.setAuthState({
            action: 'signUp',
            username: username,
            password: passwd,
        });
    }
}
