"use client";

import { useMemo, useState } from "react";
import { CustomSelect } from "./custom-select";
import { GarageIcon } from "./icons";
import {
  getModelOptions,
  makeOptions,
  yearOptions,
} from "@/data/motorcycles";

export function GarageSelector() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const modelOptions = useMemo(() => getModelOptions(make), [make]);
  const ready = Boolean(make && model && year);

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

        <form className="garage-form" action="/garage">
          <input type="hidden" name="make" value={make} />
          <input type="hidden" name="model" value={model} />
          <input type="hidden" name="year" value={year} />

          <CustomSelect
            label="Make"
            placeholder="Select make"
            options={makeOptions}
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
        </form>
      </div>
    </section>
  );
}
