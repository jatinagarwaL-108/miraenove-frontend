export interface EventResult {
    event_id: string;
    tile_id: string;
    region_id: string;
    similarity_score: number;
    t1_date: string;
    t2_date: string;
    area_m2: number;
    temporal_interval_days: number;
    siamese_mean_probability: string;
    heuristic_type: string;
    remoteclip_transition: string;
    semantic_confidence: string;
    validation_category: string;
    geometry: any;
    disclaimer: string;
}