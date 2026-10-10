import { Route, Routes } from "react-router";
import { HomePage } from "../Pages/Home";

export default function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div
        data-tauri-drag-region
        className="aspect-square h-[100vmin] w-[100vmin] max-h-full max-w-full p-4 select-none"
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}