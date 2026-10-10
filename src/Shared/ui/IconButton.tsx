import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IProps {
  icon: IconDefinition;
  onClick: () => void;
}

export const IconButton = ({ icon, onClick }: IProps) => {
  return (
    <button
      className="w-fit text-xl p-2 rounded-full cursor-pointer aspect-square border border-foreground/50"
      onClick={() => onClick()}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
};
