import { faX } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../Shared/ui/IconButton";
import { useNavigate } from "react-router";

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
    </div>
  );
};
