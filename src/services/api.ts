import axios from 'axios';
import { EventResult } from '../types/event';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
    searchEvents: async (query: string): Promise<EventResult[]> => {
        const res = await axios.get(`${API_URL}/events/search?query=${encodeURIComponent(query)}`);
        return res.data.results;
    },
    getEvent: async (eventId: string) => {
        const res = await axios.get(`${API_URL}/events/${eventId}`);
        return res.data;
    },
    getHealth: async () => {
        const res = await axios.get(`${API_URL}/health`);
        return res.data;
    }
};
