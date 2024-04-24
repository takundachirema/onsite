import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center">
      <SignIn />
    </div>
  );
}
