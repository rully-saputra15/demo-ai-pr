"use client";

import React, { useEffect, useState } from "react";

export default function Page5() {
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    console.log("Halo");
  });

  return (
    <div>
      <p>{counter}</p>
      <button onClick={() => setCounter((prev) => prev++)}>Increment</button>
    </div>
  );
}
