"use client";

import { useEffect, useState } from "react";
import { CustomSelect } from "./custom-select";
import { GarageIcon } from "./icons";
type Bike = { id: number; make: string; model: string; year: number };

export function GarageSelector() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("Loading bikes…");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/motorcycles", { signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error("Unavailable");
      setBikes(data.bikes);
      setLoaded(true);
      setMessage("");
      let id = new URLSearchParams(window.location.search).get("bike");
      try { id ??= localStorage.getItem("adventuresmoto-bike"); } catch {}
      const selected = (data.bikes as Bike[]).find((b) => String(b.id) === id);
      if (selected) { setMake(selected.make); setModel(selected.model); setYear(String(selected.year)); }
    }).catch(() => { if (!controller.signal.aborted) setMessage("Bike selection is temporarily unavailable. Please reload to try again."); });
    return () => controller.abort();
  }, []);
  const options = (values: string[]) => [...new Set(values)].sort().map((value) => ({ value, label: value }));
  const makeOptions = options(bikes.map((b) => b.make));
  const modelOptions = options(bikes.filter((b) => b.make === make).map((b) => b.model));
  const yearOptions = options(bikes.filter((b) => b.make === make && b.model === model).map((b) => String(b.year))).reverse();
  const selectedBike = bikes.find((b) => b.make === make && b.model === model && String(b.year) === year);
  const ready = Boolean(selectedBike);

  function selectMake(value: string) {
    setMake(value);
    setModel("");
    setYear("");
  }

  function selectModel(value: string) {
    setModel(value);
    setYear("");
  }

  return (
    <section
      className="garage-section"
      id="my-garage"
      aria-labelledby="garage-heading"
    >
      <div className="site-container garage-inner">
        <div className="garage-heading-wrap">
          <span className="garage-icon">
            <GarageIcon width={32} height={32} />
          </span>
          <div>
            <p>Parts that fit. First time.</p>
            <h2 id="garage-heading">My Garage</h2>
          </div>
        </div>

        <form className="garage-form" action="/garage" onSubmit={() => { try { if (selectedBike) localStorage.setItem("adventuresmoto-bike", String(selectedBike.id)); } catch {} }}>
          <input type="hidden" name="bike" value={selectedBike?.id ?? ""} />

          <CustomSelect
            label="Make"
            placeholder={loaded && !bikes.length ? "No bikes available" : "Select make"}
            options={makeOptions}
            disabled={!bikes.length}
            value={make}
            onChange={selectMake}
          />
          <CustomSelect
            label="Model"
            placeholder="Select model"
            options={modelOptions}
            value={model}
            disabled={!make}
            onChange={selectModel}
          />
          <CustomSelect
            label="Year"
            placeholder="Select year"
            options={yearOptions}
            value={year}
            disabled={!model}
            onChange={setYear}
          />

          <button className="garage-submit" type="submit" disabled={!ready}>
            Find my gear
          </button>
          {message && <p role="status" style={{ gridColumn: "1 / -1" }}>{message}</p>}
        </form>
      </div>
    </section>
  );
}
