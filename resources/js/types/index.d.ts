export type Role = 'master_dev' | 'owner' | 'admin' | 'kasir' | 'waiters';

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    tenant_id: number | null;
    employee_id?: string | null;
    email_verified_at?: string | null;
}

export interface Tenant {
    id: number;
    name: string;
    slug: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        tenant: Tenant | null;
    };
    flash: {
        success?: string | null;
        error?: string | null;
    };
    app: {
        name: string;
    };
};
