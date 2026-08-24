"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronDownIcon } from "./icons";

export type SelectOption = {
  value: string;
  label: string;
  detail?: string;
};

type CustomSelectProps = {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function CustomSelect({
  label,
  placeholder,
  options,
  value,
  disabled = false,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (disabled) return;

    if (event.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;

      if (!open) {
        setOpen(true);
        setActiveIndex(
          Math.max(0, options.findIndex((option) => option.value === value)),
        );
        return;
      }

      setActiveIndex(
        (current) => (current + direction + options.length) % options.length,
      );
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      choose(options[activeIndex]);
    }
  }

  return (
    <div
      className={`custom-select ${open ? "is-open" : ""} ${
        disabled ? "is-disabled" : ""
      }`}
      ref={rootRef}
      onKeyDown={handleKeyDown}
    >
      <span className="custom-select-label">{label}</span>
      <button
        className="custom-select-trigger"
        type="button"
        ref={triggerRef}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((current) => !current);
          setActiveIndex(
            Math.max(0, options.findIndex((option) => option.value === value)),
          );
        }}
      >
        <span className={selected ? "" : "is-placeholder"}>
          {selected?.label ?? placeholder}
          {selected?.detail ? <small>{selected.detail}</small> : null}
        </span>
        <ChevronDownIcon width={18} height={18} />
      </button>

      {open ? (
        <div className="custom-select-menu" id={listId} role="listbox">
          {options.map((option, index) => (
            <button
              className={`${option.value === value ? "is-selected" : ""} ${
                index === activeIndex ? "is-active" : ""
              }`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.detail ? <small>{option.detail}</small> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
