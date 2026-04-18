import React from "react";

const Quote = ({ quote, padding }) => {
  return (
    <div
      className="overflow-hidden flex bg-accent w-[100vw] shadow-2xl"
      style={{ paddingTop: padding, paddingBottom: padding }}
    >
      <div className="animate-slide  flex justify-center items-center text-[black] ">
        {quote.map((app, index) => (
          <span
            key={index}
            className="ab text-lg md:text-xl lg:text-2xl flex justify-center w-[150px] md:w-[200px] lg:w-[250px] "
          >
            {app}
          </span>
        ))}
      </div>

      <div className="animate-slide flex justify-center items-center text-[black] ">
        {quote.map((app, index) => (
          <span
            key={index}
            className="ab text-lg md:text-xl lg:text-2xl flex justify-center w-[150px] md:w-[200px] lg:w-[250px]"
          >
            {app}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Quote;
