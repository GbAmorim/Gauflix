import { Instagram, Twitter, Twitch, Youtube } from "lucide-react";

export default function Footer() {
    // Array de configuração com Ícone + Link
    const socialLinks = [
        {
            icon: Twitter,
            href: "https://twitter.com/Gaules",
            label: "Twitter",
        },
        {
            icon: Instagram,
            href: "https://www.instagram.com/gaules/",
            label: "Instagram",
        },
        {
            icon: Twitch,
            href: "https://www.twitch.tv/gaules",
            label: "Twitch",
        },
        {
            icon: Youtube,
            href: "https://www.youtube.com/@Gaules",
            label: "YouTube",
        },
    ];

    return (
        <footer className="w-full bg-[#0035BF] text-white py-12 border-t border-white/10 mt-auto">
            <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Logo e Slogan */}
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black italic tracking-tighter">
                        GAUFLIX
                    </h2>
                    <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mt-1">
                        Feito pela Tribo, para a Tribo.
                    </p>
                </div>

                {/* Ícones com Links */}
                <div className="flex gap-6">
                    {socialLinks.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <a
                                key={i}
                                href={item.href}
                                target="_blank" // Abre em nova aba
                                rel="noopener noreferrer" // Segurança e performance
                                aria-label={item.label} // Acessibilidade
                                className="hover:text-yellow-400 transition transform hover:scale-110 cursor-pointer"
                            >
                                <Icon size={24} />
                            </a>
                        );
                    })}
                </div>

                {/* Direitos Autorais */}
                <div className="text-blue-300 text-xs font-bold uppercase tracking-wider text-center md:text-right">
                    <p>© 2026 Tribo Gaules.</p>
                    <p>Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
