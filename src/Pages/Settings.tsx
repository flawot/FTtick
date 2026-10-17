import { faX } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../Shared/ui/IconButton";
import { useNavigate } from "react-router";
import { TimeSettings } from "../Widgets/TimeSettings";

export const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full relative">
      <span className="absolute right-0 top-0">
        <IconButton
          icon={faX}
          onClick={() => {
            navigate("/");
          }}
        />
      </span>

      <span className="absolute left-1/2 text-xl -translate-x-1/2 top-2 font-medium font-display">
        Настройки
      </span>

      <TimeSettings />
    </div>
  );
};
