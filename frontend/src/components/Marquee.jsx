import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUmbrellaBeach,
  faVolleyball,
  faChildReaching,
  faSailboat,
  faShip,
} from "@fortawesome/free-solid-svg-icons";

function Marquee() {
  const { t } = useTranslation();

  const items = [
    { icon: faUmbrellaBeach, text: t("marquee.comfortableExperience") },
    { icon: faShip, text: t("marquee.waterActivities") },
    { icon: faVolleyball, text: t("marquee.familyFriendly") },
    { icon: faChildReaching, text: t("marquee.restRelaxation") },
    { icon: faSailboat, text: t("marquee.modernShips") },
  ];

  return (
    <div dir="ltr" className="overflow-hidden w-screen py-4 text-grey/60">
      <div className="marquee-track flex items-center">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-3 mx-4 text-lg md:text-xl lg:text-2xl font-bold"
          >
            <FontAwesomeIcon icon={item.icon} size="xl" />
            <span className="w-[300px] text-center">{item.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
