import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { Search, MonitorPlay, Trophy } from "lucide-react";
import Footer from "../components/Footer";

const THEME = { bg: "bg-[#0047FF]" };

export default function Home() {
    const [campeonatos, setCampeonatos] = useState([]);
    const [anoFiltro, setAnoFiltro] = useState("TODOS");
    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data } = await supabase
                .from("campeonatos")
                .select("*")
                .order("data_inicio", { ascending: false });

            if (data) setCampeonatos(data);
            setLoading(false);
        }
        fetchData();
    }, []);

    const anosDisponiveis = useMemo(() => {
        const anos = campeonatos.map((c) => c.ano);
        return ["TODOS", ...new Set(anos)].sort((a, b) => {
            if (a === "TODOS") return -1;
            if (b === "TODOS") return 1;
            return b - a;
        });
    }, [campeonatos]);

    const campeonatosFiltrados = campeonatos.filter((c) => {
        const matchAno = anoFiltro === "TODOS" ? true : c.ano === anoFiltro;
        const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
        return matchAno && matchBusca;
    });

    return (
        <div
            className={`min-h-screen flex flex-col ${THEME.bg} text-white font-sans`}
        >
            <div className="max-w-[1800px] mx-auto w-full pt-6 md:pt-8 px-4 md:px-12 flex-1">
                {/* HEADER */}
                <header className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8 mb-10 md:mb-16 border-b-4 border-white/10 pb-8 text-center lg:text-left">
                    {/* BLOCO IDENTIDADE */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.4)] flex-shrink-0 bg-black">
                            <img
                                src="https://yt3.ggpht.com/m6s3UkM_8f4233Ayxq2NEyeJNmSMjZen3aPVhAKRyigEKi-Gw_sUMXysRA_WLEyuwq1Pw1fOVg=s176-c-k-c0x00ffffff-no-rj-mo"
                                alt="Gaules"
                                className="w-full h-full object-cover hover:scale-110 transition duration-500"
                            />
                        </div>

                        <div>
                            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-none drop-shadow-2xl">
                                GAUFLIX
                            </h1>
                            <div className="flex items-center justify-center lg:justify-start gap-3 mt-2">
                                <div className="h-1 w-8 md:w-12 bg-yellow-400"></div>
                                <p className="text-blue-200 font-bold tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm uppercase whitespace-nowrap">
                                    O Acervo da Tribo
                                </p>
                                <div className="h-1 w-8 md:w-12 bg-yellow-400"></div>
                            </div>
                        </div>
                    </div>

                    {/* BARRA DE BUSCA */}
                    <div className="w-full max-w-md">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="BUSCAR CAMPEONATO"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full bg-[#0035BF] text-white placeholder-blue-300 font-black uppercase italic px-5 py-3 md:px-6 md:py-4 rounded-full border-2 border-transparent focus:border-yellow-400 focus:bg-[#002890] outline-none transition shadow-xl text-xs md:text-sm tracking-wider"
                            />
                            <Search
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-yellow-400 transition"
                                size={18}
                            />
                        </div>
                    </div>
                </header>

                {/* FILTRO DE ANOS */}
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-6 md:pb-8 mb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    {anosDisponiveis.map((ano) => (
                        <button
                            key={ano}
                            onClick={() => setAnoFiltro(ano)}
                            className={`
                                px-5 py-2 md:px-6 md:py-3 rounded-xl font-black italic text-sm md:text-lg uppercase transition-all whitespace-nowrap cursor-pointer flex-shrink-0
                                ${
                                    anoFiltro === ano
                                        ? "bg-white text-[#0047FF] shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105 -rotate-2"
                                        : "bg-[#0035BF] text-blue-300 hover:bg-[#002890] hover:text-white hover:-translate-y-1"
                                }
                            `}
                        >
                            {ano}
                        </button>
                    ))}
                </div>

                {/* GRID DE CAMPEONATOS */}
                {loading ? (
                    <div className="text-center py-20 md:py-32 animate-pulse">
                        <MonitorPlay
                            size={48}
                            className="mx-auto text-white/20 mb-4 md:w-16 md:h-16"
                        />
                        <p className="text-white/50 font-black text-xl md:text-2xl italic uppercase tracking-widest">
                            Carregando o legado...
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 md:gap-8 pb-12 md:pb-20">
                        {campeonatosFiltrados.map((camp) => (
                            <Link to={`/campeonato/${camp.id}`} key={camp.id}>
                                <div className="group relative aspect-[3/4] cursor-pointer bg-black rounded-xl md:rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-2 md:hover:-translate-y-3 ring-2 md:ring-4 ring-transparent hover:ring-yellow-400">
                                    <img
                                        src={camp.capa_url}
                                        alt={camp.nome}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition duration-700 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                                    <div className="absolute bottom-0 left-0 w-full p-4 md:p-6">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="bg-[#0047FF] px-2 py-0.5 md:px-3 md:py-1 rounded text-[10px] md:text-xs font-black text-white shadow-lg border border-white/10">
                                                {camp.ano}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black italic uppercase leading-none text-white drop-shadow-md group-hover:text-yellow-400 transition line-clamp-2">
                                            {camp.nome}
                                        </h3>
                                        <div className="h-1 w-0 group-hover:w-full bg-yellow-400 mt-3 md:mt-4 transition-all duration-500 rounded-full" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {campeonatosFiltrados.length === 0 && !loading && (
                    <div className="text-center py-16 md:py-20 bg-[#0035BF]/30 rounded-3xl border border-white/5 mx-4">
                        <Trophy
                            size={40}
                            className="mx-auto text-white/20 mb-4 md:w-12 md:h-12"
                        />
                        <p className="text-lg md:text-xl font-bold text-white/50 italic px-4">
                            Nenhum campeonato encontrado na história.
                        </p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
