require("dotenv").config(); // Carrega o .env

const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");

// --- CONFIGURAÇÕES ---
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
);
const YT_API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLIST_ID = process.env.PLAYLIST_ID;

// --- REGRAS (MANTIDAS) ---
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
    "KINGSCUP",
    "KINGS CUP",
    "PUBG",
    "PUBG PC",
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

// --- FUNÇÃO CORRIGIDA: Usa Data de Publicação para o Ano ---
function identificarCampNoTitulo(titulo, dataPublicacao) {
    const t = limpar(titulo);
    if (BLACKLIST.some((b) => t.includes(b))) return null;

    // 1. Tenta pegar ano do Título
    let ano = null;
    const matchAno = t.match(/20[1-3][0-9]/);

    if (matchAno) {
        ano = parseInt(matchAno[0]);
    } else {
        // 2. SE NÃO TIVER NO TÍTULO, PEGA DA DATA DE PUBLICAÇÃO
        const dateObj = new Date(dataPublicacao);
        if (!isNaN(dateObj)) {
            ano = dateObj.getFullYear();
        } else {
            ano = 2024; // Fallback final
        }
    }

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
        /Gaules|Siga|@Gaules|!SOCIO|CS:GO|CS2|SOCIO|COM|IMAGENS|Transmissão|SORTEIO|nas|Redes|sociais|#agonbyaocbr|#aocgaming|Completa|MD3|BO3|MD1|VOTE|BO1|Ao Vivo|SEASON\s*\d+|S\d+/gi;
    let t = limpar(titulo.replace(removeRegex, " "));

    let fase = "OUTROS";
    let ordemFase = 99;
    let dia = 0;

    const matchDia = t.match(/(?:DIA|DAY|D)\s*(\d+)/);
    if (matchDia) dia = parseInt(matchDia[1]);

    // MELHORIA NA DETECÇÃO DE FASES (Inglês + Português)
    if (
        (t.includes("FINAL") || t.includes("DECIDER")) &&
        !t.includes("SEMI") &&
        !t.includes("QUARTA") &&
        !t.includes("QUARTER")
    ) {
        fase = "GRANDE FINAL";
        ordemFase = 1000;
    } else if (t.includes("SEMI")) {
        fase = "SEMIFINAIS";
        ordemFase = 900;
    } else if (
        t.includes("QUARTA") ||
        t.includes("QUARTER") ||
        t.includes("QTR")
    ) {
        fase = "QUARTAS DE FINAL";
        ordemFase = 800;
    } else if (t.includes("PLAYOFFS") || t.includes("PLAYOFF")) {
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

async function run() {
    console.log("🔥 Sincronização v10 (Correção de Ano + Filtro Flexível)...");
    const buffer = [];
    let nextToken = "";

    try {
        do {
            const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YT_API_KEY}&pageToken=${nextToken}`;
            const response = await axios.get(ytUrl);
            const items = response.data.items;
            nextToken = response.data.nextPageToken || "";

            for (const item of items) {
                const video = item.snippet;
                // PASSAMOS A DATA PARA A FUNÇÃO DE IDENTIFICAÇÃO
                const campInfo = identificarCampNoTitulo(
                    video.title,
                    video.publishedAt,
                );

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
            process.stdout.write(
                `\r📡 Lendo playlist... ${buffer.length} vídeos.`,
            );
        } while (nextToken);

        console.log(`\n📦 Coleta concluída. Agrupando...`);

        const campsAgrupados = {};
        buffer.forEach((b) => {
            if (!campsAgrupados[b.campData.nome])
                campsAgrupados[b.campData.nome] = [];
            campsAgrupados[b.campData.nome].push(b);
        });

        for (const nome in campsAgrupados) {
            const lista = campsAgrupados[nome];
            const listaFinal = lista.map((item) => {
                const det = extrairDetalhes(item.video.titulo, item.seq, nome);
                return { ...item, ...det };
            });

            // ANALISAR FASES
            const fases = new Set(listaFinal.map((i) => i.fase));
            const temFinal = fases.has("GRANDE FINAL");
            const temSemi = fases.has("SEMIFINAIS");
            const temQuartas =
                fases.has("QUARTAS DE FINAL") || fases.has("PLAYOFFS");

            // --- DEBUG: MOSTRAR O QUE FOI ENCONTRADO ---
            console.log(`\n🔍 Analisando: ${nome}`);
            console.log(`   Fases detectadas: ${Array.from(fases).join(", ")}`);

            const relevante =
                temFinal || temSemi || temQuartas || listaFinal.length > 2;

            if (relevante) {
                console.log(`✅ APROVADO: ${nome}`);

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
            } else {
                console.log(`⚠️ RECUSADO (Conteúdo insuficiente): ${nome}`);
            }
        }
        console.log("\n🏆 Finalizado!");
    } catch (err) {
        console.error("❌ Erro:", err.message);
    }
}

run();
