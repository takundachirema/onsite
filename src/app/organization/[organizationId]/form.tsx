"use client";

import { Button } from "@nextui-org/react";

export const Form = () => {
  return (
    <form>
      <input
        id="title"
        name="title"
        required
        placeholder="Enter a board title"
        className="mr-2 border border-black p-1"
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
