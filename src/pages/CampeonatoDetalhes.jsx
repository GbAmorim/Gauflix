import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { ArrowLeft, X, Play } from "lucide-react";
import Footer from "../components/Footer";

const THEME = { bg: "bg-[#0047FF]" };

export default function CampeonatoDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campSelecionado, setCampSelecionado] = useState(null);
    const [partidaAtiva, setPartidaAtiva] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            setLoading(true);
            const { data } = await supabase
                .from("campeonatos")
                .select("*, partidas(*)")
                .eq("id", id)
                .single();

            if (data) setCampSelecionado(data);
            setLoading(false);
        }
        fetchDetails();
    }, [id]);

    const fasesOrdenadas = useMemo(() => {
        if (!campSelecionado?.partidas) return [];

        const grupos = {};
        campSelecionado.partidas.forEach((p) => {
            if (!grupos[p.fase])
                grupos[p.fase] = {
                    nome: p.fase,
                    ordem: p.ordem_fase || 999,
                    partidas: [],
                };
            grupos[p.fase].partidas.push(p);
        });

        const ordenados = Object.values(grupos).sort(
            (a, b) => a.ordem - b.ordem,
        );

        ordenados.forEach((grupo) => {
            grupo.partidas.sort((a, b) => {
                if (a.ordem_dia > 0 && b.ordem_dia > 0)
                    return a.ordem_dia - b.ordem_dia;
                return new Date(a.data_postagem) - new Date(b.data_postagem);
            });
        });

        return ordenados;
    }, [campSelecionado]);

    // --- PLAYER RESPONSIVO ---
    const VideoPlayer = () => {
        if (!partidaAtiva) return null;
        return (
            <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-300">
                {/* Header do Player: Mais compacto no mobile */}
                <div className="flex justify-between items-start md:items-center p-4 md:p-6 bg-gradient-to-b from-black to-transparent">
                    <div className="pr-4">
                        <h2 className="text-lg md:text-xl font-black italic uppercase text-yellow-400 line-clamp-2">
                            {partidaAtiva.titulo_partida}
                        </h2>
                        <span className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-widest text-white">
                            {partidaAtiva.fase}
                        </span>
                    </div>
                    <button
                        onClick={() => setPartidaAtiva(null)}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition cursor-pointer flex-shrink-0"
                    >
                        <X className="text-white" size={24} />
                    </button>
                </div>

                {/* Área do Vídeo */}
                <div className="flex-1 flex items-center justify-center p-2 md:p-4">
                    <div className="w-full max-w-6xl aspect-video bg-black shadow-2xl rounded-xl overflow-hidden border border-white/10">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${partidaAtiva.youtube_id}?autoplay=1&rel=0`}
                            title="Player"
                            allowFullScreen
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (loading)
        return (
            <div
                className={`${THEME.bg} min-h-screen text-white flex items-center justify-center`}
            >
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-yellow-400 rounded-full mb-4 animate-bounce"></div>
                    <span className="font-black italic uppercase tracking-widest opacity-50">
                        Carregando...
                    </span>
                </div>
            </div>
        );

    if (!campSelecionado)
        return (
            <div
                className={`${THEME.bg} min-h-screen text-white flex items-center justify-center`}
            >
                Campeonato não encontrado
            </div>
        );

    return (
        <div
            className={`min-h-screen flex flex-col ${THEME.bg} text-white font-sans selection:bg-yellow-400 selection:text-black`}
        >
            <VideoPlayer />

            {/* HEADER STICKY RESPONSIVO */}
            <div className="sticky top-0 z-40 bg-[#0047FF]/95 backdrop-blur-md border-b border-white/10 shadow-lg transition-all">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-sm md:text-base font-black italic uppercase hover:text-yellow-400 transition tracking-widest cursor-pointer group"
                    >
                        <ArrowLeft
                            strokeWidth={3}
                            className="group-hover:-translate-x-1 transition"
                            size={20}
                        />
                        <span className="hidden sm:inline">Voltar</span>
                    </button>
                    {/* Título truncado no mobile para não quebrar */}
                    <h1 className="text-sm sm:text-xl md:text-3xl font-black italic uppercase truncate ml-4 text-white max-w-[70%] text-right">
                        {campSelecionado.nome}
                    </h1>
                </div>
            </div>

            {/* HERO SECTION RESPONSIVO */}
            <div className="relative h-[35vh] md:h-[40vh] w-full overflow-hidden group">
                <img
                    src={campSelecionado.capa_url}
                    alt={campSelecionado.nome}
                    className="w-full h-full object-cover opacity-60 mix-blend-multiply group-hover:scale-105 transition duration-[2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0047FF] via-transparent to-black/30" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex items-end">
                    <div>
                        <span className="bg-yellow-400 text-black px-2 py-1 md:px-3 text-xs md:text-sm font-black uppercase rounded mb-2 md:mb-4 inline-block shadow-lg">
                            {campSelecionado.ano}
                        </span>
                        {/* Título Responsivo: text-4xl no mobile -> text-7xl no desktop */}
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase leading-none drop-shadow-2xl">
                            {campSelecionado.nome}
                        </h1>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full flex-1">
                {fasesOrdenadas.map((grupo) => (
                    <div key={grupo.nome} className="mb-12 md:mb-16">
                        {/* Título da Fase */}
                        <div className="flex items-center gap-4 mb-6 md:mb-8">
                            <h2 className="text-2xl md:text-4xl font-black italic uppercase text-yellow-400 drop-shadow-md whitespace-nowrap">
                                {grupo.nome}
                            </h2>
                            <div className="h-1 flex-1 bg-white/10 rounded-full" />
                        </div>

                        {/* GRID DE PARTIDAS: 1 col (mobile), 2 (sm), 3 (lg)... */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {grupo.partidas.map((partida) => (
                                <div
                                    key={partida.id}
                                    onClick={() => setPartidaAtiva(partida)}
                                    className="bg-[#050510] group cursor-pointer rounded-xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all duration-300 hover:-translate-y-2 border border-white/5 hover:border-yellow-400/50 flex flex-col"
                                >
                                    <div className="aspect-video relative overflow-hidden">
                                        <img
                                            src={partida.thumbnail_url}
                                            alt={partida.titulo_partida}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500"
                                        />

                                        {/* Tag do Dia */}
                                        {partida.ordem_dia > 0 &&
                                            partida.ordem_dia < 50 && (
                                                <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded shadow-md uppercase">
                                                    Dia {partida.ordem_dia}
                                                </div>
                                            )}

                                        {/* Overlay de Play */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300">
                                            <Play
                                                fill="white"
                                                size={48}
                                                className="drop-shadow-lg transform scale-90 group-hover:scale-110 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Título da Partida */}
                                    <div className="p-4 flex-1 flex items-center">
                                        <h4 className="font-bold text-sm leading-tight text-white group-hover:text-yellow-400 transition line-clamp-2 uppercase italic">
                                            {partida.titulo_partida}
                                        </h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
}
