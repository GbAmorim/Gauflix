// Arquivo: bot/api/cron.js
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

// --- 1. SEGURANÇA: PEGAR CREDENCIAIS DAS VARIÁVEIS DE AMBIENTE ---
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
);
const YT_API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLIST_ID = process.env.PLAYLIST_ID;

// --- 2. REGRAS E LISTAS (MANTENHA IGUAL AO SEU) ---
const REGRAS_NOMES = [
    { termo: "MAJOR SHANGHAI", nome: "Shanghai Major" },
    { termo: "MAJOR COPENHAGEN", nome: "PGL Major Copenhagen" },
    { termo: "BLAST AUSTIN", nome: "BLAST.tv Austin Major" },
    { termo: "MAJOR PARIS", nome: "BLAST.tv Paris Major" },
    { termo: "MAJOR RIO", nome: "IEM Rio Major" },
    { termo: "MAJOR ANTWERP", nome: "PGL Major Antwerp" },
    { termo: "MAJOR STOCKHOLM", nome: "PGL Major Stockholm" },
    { termo: "IEM KATOWICE", nome: "IEM Katowice" },
    { termo: "IEM KRAKOW", nome: "IEM Kraków" },
    { termo: "IEM COLOGNE", nome: "IEM Cologne" },
    { termo: "IEM RIO", nome: "IEM Rio" },
    { termo: "IEM DALLAS", nome: "IEM Dallas" },
    { termo: "IEM CHENGDU", nome: "IEM Chengdu" },
    { termo: "IEM SYDNEY", nome: "IEM Sydney" },
    { termo: "IEM FALL", nome: "IEM Fall" },
    { termo: "IEM BEIJING", nome: "IEM Beijing" },
    { termo: "IEM NEW YORK", nome: "IEM New York" },
    { termo: "IEM CHICAGO", nome: "IEM Chicago" },
    { termo: "BLAST WORLD FINAL", nome: "BLAST Premier World Final" },
    { termo: "BLAST SPRING FINAL", nome: "BLAST Premier Spring Final" },
    { termo: "BLAST FALL FINAL", nome: "BLAST Premier Fall Final" },
    { termo: "BLAST SPRING GROUPS", nome: "BLAST Premier Spring Groups" },
    { termo: "BLAST FALL GROUPS", nome: "BLAST Premier Fall Groups" },
    { termo: "BLAST SPRING SHOWDOWN", nome: "BLAST Premier Spring Showdown" },
    { termo: "BLAST FALL SHOWDOWN", nome: "BLAST Premier Fall Showdown" },
    { termo: "BLAST BOUNTY", nome: "BLAST Bounty Hunt" },
    { termo: "BLAST RIVALS", nome: "BLAST Rivals" },
    { termo: "BLAST LONDON", nome: "BLAST Premier London" },
    { termo: "ESL PRO LEAGUE", nome: "ESL Pro League" },
    { termo: "EPL", nome: "ESL Pro League" },
    { termo: "ESL CHALLENGER", nome: "ESL Challenger" },
    { termo: "ESL ONE", nome: "ESL One" },
    { termo: "ESPORTS WORLD CUP", nome: "Esports World Cup" },
    { termo: "EWC", nome: "Esports World Cup" },
    { termo: "GAMERS8", nome: "Gamers8" },
    { termo: "THUNDERPICK", nome: "Thunderpick World Championship" },
    { termo: "BETBOOM", nome: "BetBoom Dacha" },
    { termo: "ROOBET", nome: "Roobet Cup" },
    { termo: "BRAZY PARTY", nome: "Brazy Party" },
    { termo: "SKYESPORTS", nome: "Skyesports Masters" },
    { termo: "ELISA MASTERS", nome: "Elisa Masters" },
    { termo: "GLOBAL ESPORTS TOUR", nome: "Global Esports Tour" },
    { termo: "GET RIO", nome: "Global Esports Tour Rio" },
    { termo: "CBCS", nome: "CBCS" },
    { termo: "FIRELEAGUE", nome: "FiReLEAGUE" },
    { termo: "COPA BETBOOM", nome: "Copa BetBoom" },
    { termo: "LIGA GAMERS CLUB", nome: "Liga Gamers Club" },
    { termo: "PLT", nome: "Pela Lato Travessia" },
    { termo: "BLAST", nome: "BLAST Premier" },
    { termo: "IEM", nome: "IEM" },
    { termo: "MAJOR", nome: "Major Championship" },
];

const BLACKLIST = [
    "KINGS LEAGUE",
    "FUTEBOL",
    "POKER",
    "GOLF",
    "F1",
    "REACT",
    "PODCAST",
    "SHORTS",
    "GTA",
    "MINECRAFT",
    "RERUN",
];

const limpar = (str) =>
    str
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9\s]/g, " ")
        .trim();

// --- 3. FUNÇÕES AUXILIARES ---
function identificarCampNoTitulo(titulo) {
    const t = limpar(titulo);
    if (BLACKLIST.some((b) => t.includes(b))) return null;

    let ano = 2024;
    const matchAno = t.match(/20[1-3][0-9]/);
    if (matchAno) ano = parseInt(matchAno[0]);

    let season = null;
    const matchSeason = t.match(/(?:SEASON|S)\s*(\d{1,2})/);
    if (matchSeason) season = matchSeason[1];

    for (const regra of REGRAS_NOMES) {
        if (t.includes(regra.termo)) {
            let nomeFinal = regra.nome;
            if (season) nomeFinal = `${regra.nome} Season ${season}`;
            nomeFinal = `${nomeFinal} ${ano}`.trim();
            return { nome: nomeFinal, ano, season };
        }
    }
    return null;
}

function extrairDetalhes(titulo, indexSequencial, nomeCampeonato) {
    let removeRegex =
        /Gaules|Siga|@Gaules|!SOCIO|CS:GO|CS2|Transmissão|Completa|MD3|BO3|MD1|BO1|Ao Vivo|SEASON\s*\d+|S\d+/gi;
    let t = limpar(titulo.replace(removeRegex, " "));
    let fase = "OUTROS";
    let ordemFase = 99;
    let dia = 0;

    const matchDia = t.match(/(?:DIA|DAY|D)\s*(\d+)/);
    if (matchDia) dia = parseInt(matchDia[1]);

    if (t.includes("FINAL") && !t.includes("SEMI") && !t.includes("QUARTA")) {
        fase = "GRANDE FINAL";
        ordemFase = 1000;
    } else if (t.includes("SEMI")) {
        fase = "SEMIFINAIS";
        ordemFase = 900;
    } else if (t.includes("QUARTAS") || t.includes("QUARTER")) {
        fase = "QUARTAS DE FINAL";
        ordemFase = 800;
    } else if (t.includes("PLAYOFFS")) {
        fase = "PLAYOFFS";
        ordemFase = 750;
    } else if (t.match(/STAGE\s*(\d+)/)) {
        const num = t.match(/STAGE\s*(\d+)/)[1];
        fase = `STAGE ${num}`;
        ordemFase = parseInt(num);
    } else if (dia > 0) {
        fase = `DIA ${dia}`;
        ordemFase = 100 + dia;
    }

    let jogo = titulo
        .replace(removeRegex, "")
        .replace(/[|!-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (jogo.length < 5) jogo = `Transmissão - ${fase}`;
    return { fase, ordemFase, dia, jogo };
}

// --- 4. EXPORTAÇÃO PARA VERCEL (O SEGREDO) ---
export default async function handler(req, res) {
    // Verificação de Segurança Opcional
    // if (req.query.key !== process.env.CRON_SECRET) {
    //     return res.status(401).json({ error: 'Não autorizado' });
    // }

    console.log("🔥 Vercel Cron: Iniciando...");
    const buffer = [];
    let nextToken = "";

    // LIMITADOR PARA NÃO ESTOURAR O TEMPO DA VERCEL (TIMEOUT DE 10s)
    // Vamos pegar apenas as 2 primeiras páginas (100 vídeos) para ser rápido
    let paginasLidas = 0;
    const MAX_PAGINAS = 2;

    try {
        do {
            const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YT_API_KEY}&pageToken=${nextToken}`;
            const response = await axios.get(ytUrl);
            const items = response.data.items;
            nextToken = response.data.nextPageToken || "";
            paginasLidas++;

            for (const item of items) {
                const video = item.snippet;
                const campInfo = identificarCampNoTitulo(video.title);

                if (campInfo) {
                    buffer.push({
                        video: {
                            id: video.resourceId.videoId,
                            titulo: video.title,
                            thumb:
                                video.thumbnails?.maxres?.url ||
                                video.thumbnails?.high?.url,
                            data: video.publishedAt,
                        },
                        campData: campInfo,
                        seq: buffer.length + 1,
                    });
                }
            }
        } while (nextToken && paginasLidas < MAX_PAGINAS); // Loop limitado

        // LÓGICA DE SALVAMENTO
        const campsAgrupados = {};
        buffer.forEach((b) => {
            if (!campsAgrupados[b.campData.nome])
                campsAgrupados[b.campData.nome] = [];
            campsAgrupados[b.campData.nome].push(b);
        });

        let salvosCount = 0;

        for (const nome in campsAgrupados) {
            const lista = campsAgrupados[nome];
            const listaFinal = lista.map((item) => {
                const det = extrairDetalhes(item.video.titulo, item.seq, nome);
                return { ...item, ...det };
            });

            const fases = new Set(listaFinal.map((i) => i.fase));
            const temFinal = fases.has("GRANDE FINAL");
            const temSemi = fases.has("SEMIFINAIS");
            const temQuartas =
                fases.has("QUARTAS DE FINAL") || fases.has("PLAYOFFS");

            if (temFinal && temSemi && temQuartas) {
                const { data: campDB } = await supabase
                    .from("campeonatos")
                    .upsert(
                        {
                            nome: nome,
                            ano: lista[0].campData.ano,
                            slug: nome.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                            capa_url: lista[0].video.thumb,
                        },
                        { onConflict: "nome" },
                    )
                    .select()
                    .single();

                for (const item of listaFinal) {
                    await supabase.from("partidas").upsert(
                        {
                            campeonato_id: campDB.id,
                            titulo_partida: item.jogo,
                            youtube_id: item.video.id,
                            fase: item.fase,
                            ordem_fase: item.ordemFase,
                            thumbnail_url: item.video.thumb,
                            data_postagem: item.video.data,
                        },
                        { onConflict: "youtube_id" },
                    );
                }
                salvosCount++;
            }
        }

        return res.status(200).json({
            status: "Success",
            message: `Processamento concluído. ${salvosCount} campeonatos processados.`,
            videos_analisados: buffer.length,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
