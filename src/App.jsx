import { Route, Routes } from "react-router-dom";
import Catalog from "./pages/Catalog.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/produto/:id" element={<ProductDetail />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
