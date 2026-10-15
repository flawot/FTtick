import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
  icon: IconDefinition;
  onClick: () => void;
}

export const IconButton = ({ icon, onClick }: IProps) => {
  return (
    <button
      className="w-12 flex justify-center items-center text-xl p-2 text-foreground transition-all duration-100 hover:scale-105 active:scale-95 rounded-full cursor-pointer aspect-square border border-surface"
      onClick={() => onClick()}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};
