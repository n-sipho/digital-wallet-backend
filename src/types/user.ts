export interface User {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password_hash: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserAuthToken {
    id: string;
    role: string;
}   