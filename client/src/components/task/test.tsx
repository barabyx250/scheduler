import { Button } from "antd";
import React, { useState, useEffect } from "react";

interface TestProps {}
export const Test: React.FC<TestProps> = () => {
  const [counter, setCounter] = useState(0);

  return (
    <div>
      Counter {counter}{" "}
      <Button
        type={"primary"}
        onClick={() => {
          setCounter(counter + 1);
        }}
      >
        +
      </Button>
    </div>
  );
};
