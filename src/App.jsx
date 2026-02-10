import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CampeonatoDetalhes from "./pages/CampeonatoDetalhes";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                {/* O :id indica que é um parâmetro dinâmico na URL */}
                <Route
                    path="/campeonato/:id"
                    element={<CampeonatoDetalhes />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
