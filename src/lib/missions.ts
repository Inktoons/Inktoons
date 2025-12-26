
export type MissionData = {
    id: string;
    title: string;
    description: string;
    reward: number;
    target: number;
    type: 'easy' | 'medium' | 'hard' | 'expert';
    category: 'read' | 'social' | 'explore' | 'engagement';
};

export const MISSION_POOL: MissionData[] = [
    // 5 Inks - Easy (Balanced)
    { id: 'pool_1', title: 'Explorador Curioso', description: 'Visita la página de detalles de 2 series.', reward: 5, target: 2, type: 'easy', category: 'explore' },
    { id: 'pool_2', title: 'Primeros Pasos', description: 'Lee el primer capítulo de cualquier serie.', reward: 5, target: 1, type: 'easy', category: 'read' },
    { id: 'pool_3', title: 'Fan Naciente', description: 'Dale "Me Gusta" a 1 capítulo.', reward: 5, target: 1, type: 'easy', category: 'engagement' },
    { id: 'pool_4', title: 'Buscador de Tesoros', description: 'Usa el buscador para encontrar una historia.', reward: 5, target: 1, type: 'easy', category: 'explore' },
    { id: 'pool_5', title: 'Saludo Amistoso', description: 'Visita el perfil de un creador.', reward: 5, target: 1, type: 'easy', category: 'social' }, // Changed to social
    { id: 'pool_6', title: 'Bienvenido', description: 'Inicia sesión en Inktoons hoy.', reward: 5, target: 1, type: 'easy', category: 'engagement' }, // Changed to engagement (login is acting)
    { id: 'pool_7', title: 'Vistazo Rápido', description: 'Abre 3 portadas de cómics diferentes.', reward: 5, target: 3, type: 'easy', category: 'explore' },
    { id: 'pool_8', title: 'Curioso del Género', description: 'Filtra el catálogo por un género.', reward: 5, target: 1, type: 'easy', category: 'read' }, // loosely read/explore

    // 10 Inks - Medium-Low (Balanced)
    { id: 'pool_9', title: 'Lector Casual', description: 'Lee 3 capítulos hoy.', reward: 10, target: 3, type: 'medium', category: 'read' },
    { id: 'pool_10', title: 'Doble Check', description: 'Lee capítulos de 2 series diferentes.', reward: 10, target: 2, type: 'medium', category: 'explore' }, // Changed to explore (browsing diff series)
    { id: 'pool_11', title: 'Seguidor Fiel', description: 'Sigue a 1 nuevo autor.', reward: 10, target: 1, type: 'medium', category: 'social' },
    { id: 'pool_12', title: 'Crítico Amateur', description: 'Valora una serie con 5 estrellas.', reward: 10, target: 1, type: 'medium', category: 'engagement' },
    { id: 'pool_13', title: 'Maratón Mini', description: 'Lee 3 capítulos de la misma serie seguidos.', reward: 10, target: 3, type: 'medium', category: 'read' },
    { id: 'pool_14', title: 'Amante del Arte', description: 'Dale "Me Gusta" a 3 capítulos.', reward: 10, target: 3, type: 'medium', category: 'engagement' },

    // 15 Inks - Medium
    { id: 'pool_15', title: 'Lector Ávido', description: 'Lee 5 capítulos de cualquier género.', reward: 15, target: 5, type: 'medium', category: 'read' },
    { id: 'pool_16', title: 'Voz de la Comunidad', description: 'Deja un comentario en un capítulo.', reward: 15, target: 1, type: 'medium', category: 'social' }, // Commenting is social/engagement
    { id: 'pool_17', title: 'Diversidad Literaria', description: 'Lee 1 capítulo de 3 géneros distintos.', reward: 15, target: 3, type: 'medium', category: 'explore' },
    { id: 'pool_18', title: 'Cazador de Estrenos', description: 'Lee el último capítulo publicado de una serie.', reward: 15, target: 1, type: 'medium', category: 'read' },
    { id: 'pool_19', title: 'Compartir es Vivir', description: 'Comparte una serie con un amigo.', reward: 15, target: 1, type: 'medium', category: 'social' },
    { id: 'pool_20', title: 'Rutina Diaria', description: 'Lee un capítulo mañana y tarde.', reward: 15, target: 2, type: 'medium', category: 'read' },

    // 20 Inks - Hard
    { id: 'pool_21', title: 'Devorador de Libros', description: 'Lee 10 capítulos en total hoy.', reward: 20, target: 10, type: 'hard', category: 'read' },
    { id: 'pool_22', title: 'Influencer', description: 'Sigue a 3 autores y comenta en 1 obra.', reward: 20, target: 4, type: 'hard', category: 'social' },
    { id: 'pool_23', title: 'Debate Club', description: 'Escribe 3 comentarios constructivos.', reward: 20, target: 3, type: 'hard', category: 'engagement' },
    { id: 'pool_24', title: 'Explorador Profundo', description: 'Lee 5 capítulos de una serie que no seguías.', reward: 20, target: 5, type: 'hard', category: 'explore' },

    // 25 Inks - Expert
    { id: 'pool_25', title: 'Leyenda de la Tinta', description: 'Lee 20 capítulos hoy.', reward: 25, target: 20, type: 'expert', category: 'read' },
    { id: 'pool_26', title: 'Superfan', description: 'Valora 5 series y like a 5 caps.', reward: 25, target: 10, type: 'expert', category: 'engagement' },
    { id: 'pool_27', title: 'Crítico de Elite', description: 'Escribe 5 comentarios y valora 3 series.', reward: 25, target: 8, type: 'expert', category: 'social' },
    { id: 'pool_28', title: 'Embajador', description: 'Comparte 5 series diferentes.', reward: 25, target: 5, type: 'expert', category: 'social' },

    // VIP Exclusive
    { id: 'pool_vip_1', title: 'Coleccionista VIP', description: 'Descarga 1 capítulo para leer offline.', reward: 20, target: 1, type: 'medium', category: 'engagement' },
];

export function getRandomMissions(): MissionData[] {
    const patterns = [
        [5, 10, 20, 25],
        [5, 5, 25, 25],
        [10, 10, 20, 20],
        [5, 15, 20, 20],
        [10, 15, 15, 20],
        [5, 15, 15, 25]
    ];

    // Retry logic to ensure maximum diversity
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        attempts++;
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

        const byReward: Record<number, MissionData[]> = {};
        MISSION_POOL.forEach(m => {
            if (!byReward[m.reward]) byReward[m.reward] = [];
            byReward[m.reward].push(m);
        });

        const selectedMissions: MissionData[] = [];
        const usedIds = new Set<string>();
        const usedCategories = new Set<string>();

        let possible = true;

        for (const reward of selectedPattern) {
            // Prioritize candidates with UNUSED categories
            let candidates = byReward[reward].filter(m => !usedIds.has(m.id));
            if (candidates.length === 0) { possible = false; break; }

            // Try to find one with a new category
            const uniqueCatCandidates = candidates.filter(m => !usedCategories.has(m.category));

            let chosen: MissionData;

            if (uniqueCatCandidates.length > 0) {
                chosen = uniqueCatCandidates[Math.floor(Math.random() * uniqueCatCandidates.length)];
            } else {
                chosen = candidates[Math.floor(Math.random() * candidates.length)];
            }

            selectedMissions.push(chosen);
            usedIds.add(chosen.id);
            usedCategories.add(chosen.category);
        }

        if (possible) {
            // If we have at least 3 unique categories, we accept. 
            // Ideally 4, but some patterns might make it hard (though with updated pool it should be easy).
            if (usedCategories.size >= 3) {
                return selectedMissions;
            }
        }
    }

    // Fallback if loop finishes without perfect match (should rarely happen)
    // Just return the last valid selection or a safe fallback.
    // Re-run simple logic:
    const fallbackPattern = patterns[0];
    const simpleMissions: MissionData[] = [];
    const usedIds = new Set<string>();
    for (const reward of fallbackPattern) {
        const candidates = MISSION_POOL.filter(m => m.reward === reward && !usedIds.has(m.id));
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        simpleMissions.push(chosen);
        usedIds.add(chosen.id);
    }
    return simpleMissions;
}
