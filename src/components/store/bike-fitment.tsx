import Link from "next/link";
import type { ProductDetails } from "@/lib/product-details";

export function BikeFitment({ fitments = [] }: { fitments: ProductDetails["fitments"] }) {
  const makes = [...new Set(fitments.map((f) => f.make))].sort();
  return <details className="product-accordion" open>
    <summary>Bike fitment</summary>
    <p>{fitments.length ? "This product fits the bikes listed below. Please check any fitment notes." : "Compatibility has not been confirmed. Contact us before ordering for a specific bike."}</p>
    {makes.map((make) => {
      const bikes = fitments.filter((f) => f.make === make).sort((a, b) => a.model.localeCompare(b.model) || a.year - b.year);
      return <details key={make} className="bike-fitment-group"><summary>{make} <span>({bikes.length})</span></summary><ul>{bikes.map((bike) => <li key={bike.id}><Link href={`/garage?bike=${bike.id}`}>{bike.make} {bike.model} {bike.year}</Link>{bike.note && <p>{bike.note}</p>}</li>)}</ul></details>;
    })}
  </details>;
}
