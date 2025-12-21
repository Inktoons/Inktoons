export interface NewsItem {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    author: string;
    imageUrl: string;
}

export const mockNews: NewsItem[] = [
    {
        id: "1",
        title: "El legado de los Pioneros: Crónicas de la Red Abierta",
        excerpt: "Una mirada profunda a los hitos que definieron el ecosistema Pi desde sus inicios. Descubre las historias de los validadores y desarrolladores.",
        category: "Crónicas",
        date: "21 Dic 2025",
        author: "Pi Explorer",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "2",
        title: "Inktoons: El Renacimiento de la Lectura Digital",
        excerpt: "Cómo la descentralización está cambiando la forma en que consumimos literatura y noticias. Una plataforma diseñada para la comunidad Pi.",
        category: "Noticias",
        date: "20 Dic 2025",
        author: "Elena Read",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "3",
        title: "Nuevos Horizontes: DApps de Entretenimiento en Pi",
        excerpt: "La explosión de creatividad en el Pi Browser. Conoce las nuevas aplicaciones que están redefiniendo el entretenimiento Web3.",
        category: "Ecosistema",
        date: "19 Dic 2025",
        author: "Marc Tech",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
    },
];
