import { useState, useEffect } from "react";

import Hero from "../components/Hero";
import Statistics from "../components/Statistics";

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <>
      <Hero />
      {isClient && <Statistics />}
    </>
  );
}
