import { ChartHpp } from "@/components/ChartHpp";
import { ChartPopuler } from "@/components/ChartPopuler";
import SalesCard from "@/components/SalesCard";
import { TabelTransaksi } from "@/components/TabelTransaksi";
import WaStatus from "@/components/WaStatus";

export default function Home() {
  return (
    <div className="p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Home</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <WaStatus />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <SalesCard />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md flex gap-6">
        <div className="flex-1">
          <ChartHpp />
        </div>
        <div className="flex-1">
          <ChartPopuler />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <TabelTransaksi />
      </div>
    </div>
  );
}
