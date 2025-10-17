import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";

export const Route = createFileRoute("/counter")({
  component: Counter,
});

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-2">
      <div className="card">
        <Button
          leftSection={<IconPhoto size={14} />}
          variant="filled"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>
      </div>
    </div>
  );
}
