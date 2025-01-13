export default function Layout({
  children,
  expenses,
  tasks,
}: {
  children: React.ReactNode;
  expenses: React.ReactNode;
  tasks: React.ReactNode;
}) {
  return (
    <div className="flex h-10 w-full flex-col p-4">
      {children}
      {expenses}
      {tasks}
    </div>
  );
}
