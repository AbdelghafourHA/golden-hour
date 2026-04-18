import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUmbrellaBeach,
  faVolleyball,
  faChildReaching,
  faSailboat,
  faShip,
} from "@fortawesome/free-solid-svg-icons";

const items = [
  { text: <FontAwesomeIcon icon={faUmbrellaBeach} size="xl" /> },
  { text: <p className="w-[300px] text-center">تجربة مريحة و آمنة</p> },
  { text: <FontAwesomeIcon icon={faShip} size="xl" /> },
  { text: <p className="w-[300px] text-center">أنشطة بحرية</p> },
  { text: <FontAwesomeIcon icon={faVolleyball} size="xl" /> },
  { text: <p className="w-[300px] text-center">مناسب للعائلات</p> },
  { text: <FontAwesomeIcon icon={faChildReaching} size="xl" /> },
  { text: <p className="w-[300px] text-center">راحة واسترخاء</p> },
  { text: <FontAwesomeIcon icon={faSailboat} size="xl" /> },
  { text: <p className="w-[300px] text-center">سفن حديثة و مجهزة</p> },
];

function Marquee() {
  return (
    <div dir="ltr" className="overflow-hidden w-screen py-4 text-grey/60">
      <div className="marquee-track flex items-center">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="text-lg md:text-xl lg:text-2xl font-bold flex justify-center"
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Marquee;
