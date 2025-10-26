import type { Club, CreateClubDto, LoginDto, RegisterDto, User } from "@/types";
import type { ApiError } from "@/types/Api";
import { Preferences } from '@capacitor/preferences';
import { CapacitorCookies } from '@capacitor/core';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Gestion du stockage local (pour les données non-sensibles)
export const storage = {
    async get(key: string): Promise<string | null> {
        const { value } = await Preferences.get({ key });
        return value;
    },
    async set(key: string, value: string): Promise<void> {
        await Preferences.set({ key, value });
    },
    async remove(key: string): Promise<void> {
        await Preferences.remove({ key });
    }
};

// Vérifier si on est authentifié en checkant les cookies
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const cookies = await CapacitorCookies.getCookies();
        return !!cookies.auth_token;
    } catch {
        return false;
    }
};

async function fetchApi<T>(
    endpoint:string,
    options?: RequestInit
) : Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        credentials: 'include', // Important pour envoyer les cookies
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        }
    })

    if(!response.ok) {
        let error: ApiError
        try {
            error = await response.json()
        } catch {
            error = { message: `HTTP ${response.status}: ${response.statusText}`}
        }
        throw error
    }

    return response.json()
}

export const authApi = {
    register: (data: RegisterDto): Promise<{ user: User }> => {
        return fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    login: (data: LoginDto): Promise<{ user: User }> => {
        return fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    me: (): Promise<User> => {
        return fetchApi('/auth/me');
    },

    logout: async (): Promise<void> => {
        await fetchApi('/auth/logout', {
            method: 'POST'
        });
        // Supprimer tous les cookies
        await CapacitorCookies.clearAllCookies();
    }
};

export const clubsApi = {
    create: (data: CreateClubDto): Promise<Club> => {
        return fetchApi('/clubs', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    userClub: (): Promise<Club> => {
        return fetchApi('/clubs/user')
    },

    getAll: (): Promise<Club[]> => {
        return fetchApi('/clubs')
    },

    getById: (id: string): Promise<Club> => {
        return fetchApi(`/clubs/${id}`)
    }
}

export const api = {
  auth: authApi,
  clubs: clubsApi,
}