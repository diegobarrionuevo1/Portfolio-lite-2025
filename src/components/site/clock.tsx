"use client";

import { useEffect, useState } from "react";

/** Live Córdoba time (GMT−3), refreshed every 20s. */
export function Clock() {
  const [time, setTime] = useState("—");

  useEffect(() => {
    const paint = () =>
      setTime(
        new Date().toLocaleTimeString("es-AR", {
          timeZone: "America/Argentina/Cordoba",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    paint();
    const id = setInterval(paint, 20000);
    return () => clearInterval(id);
  }, []);

  return <span data-numeric>{time}</span>;
}
