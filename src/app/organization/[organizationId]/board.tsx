import { Button } from "@nextui-org/react";

interface BoardProps {
  title: string;
  id: string;
}

export const Board = ({ title, id }: BoardProps) => {
  return (
    <form className="flex items-center gap-x-2">
      <p>Board title: {title}</p>
      <Button size="sm">Delete</Button>
    </form>
  );
};
