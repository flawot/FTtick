import { Route, Routes } from "react-router";
import { HomePage } from "../Pages/Home";
import { SettingsPage } from "../Pages/Settings";

export default function App() {
  return (
    <div className="flex font-display h-screen w-screen items-center justify-center select-none">
      <div
        data-tauri-drag-region
        className="aspect-square h-[100vmin] w-[100vmin] max-h-full max-w-full p-4"
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}