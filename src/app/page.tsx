import WaStatus from "@/components/WaStatus";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold p-4">Home</h1>
      <WaStatus />
    </div>
  );
}
