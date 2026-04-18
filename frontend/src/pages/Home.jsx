import React from "react";
import Nav from "../components/Nav";
import Hero from "../sections/Hero";
import Marquee from "../components/Marquee";
import Boats from "../sections/Boats";
import Booking from "../sections/Booking";
import Contact from "../sections/Contact";

const Home = () => {
  return (
    <div className="overflow-hidden">
      <Nav />
      <Hero />
      <Marquee />
      <Boats />
      <Booking />
      <Contact />
    </div>
  );
};

export default Home;
