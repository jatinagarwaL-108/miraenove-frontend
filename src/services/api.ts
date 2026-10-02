import axios from 'axios';
import { EventResult } from '../types/event';

const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_URL = rawUrl.replace(/\/$/, '') + '/api';

export const api = {
    searchEvents: async (
        query: string, 
        topK: number = 10,
        startDate?: string,
        endDate?: string,
        minArea?: string,
        maxArea?: string,
        confidence?: string,
        transition?: string
    ): Promise<EventResult[]> => {
        let url = API_URL + '/events/search?query=' + encodeURIComponent(query) + '&top_k=' + topK;
        if (startDate) url += '&start_date=' + encodeURIComponent(startDate);
        if (endDate) url += '&end_date=' + encodeURIComponent(endDate);
        if (minArea) url += '&min_area=' + encodeURIComponent(minArea);
        if (maxArea) url += '&max_area=' + encodeURIComponent(maxArea);
        if (confidence) url += '&semantic_confidence=' + encodeURIComponent(confidence);
        if (transition) url += '&transition=' + encodeURIComponent(transition);
        
        const res = await axios.get(url, { headers: { "ngrok-skip-browser-warning": "true" } });
        return res.data.results;
    },
        getReview: async (eventId: string) => {
        const res = await axios.get(`${API_URL}/events/${eventId}/review`);
        return res.data;
    },
    postReview: async (eventId: string, payload: any) => {
        const res = await axios.post(`${API_URL}/events/${eventId}/review`, payload);
        return res.data;
    },
    getEvent: async (eventId: string) => {
        const res = await axios.get(API_URL + '/events/' + eventId, { headers: { "ngrok-skip-browser-warning": "true" } });
        return res.data;
    },
    getHealth: async () => {
        const res = await axios.get(API_URL + '/health', { headers: { "ngrok-skip-browser-warning": "true" } });
        return res.data;
    }
};

