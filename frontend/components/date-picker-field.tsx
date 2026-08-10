"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { FieldIcon } from "@/components/field-icon";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDisplayDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function parseTypedDate(text: string): Date | undefined {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return undefined;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : undefined;
}

export function DatePickerField({
  id,
  label,
  value,
  onChange,
  errors,
  action,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: Array<{ message?: string } | undefined>;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [syncedValue, setSyncedValue] = useState(value);
  const [month, setMonth] = useState<Date | undefined>(() => parseISODate(value));
  const [inputValue, setInputValue] = useState(() => formatDisplayDate(parseISODate(value)));

  if (value !== syncedValue) {
    setSyncedValue(value);
    const date = parseISODate(value);
    setInputValue(formatDisplayDate(date));
    setMonth(date);
  }

  return (
    <Field data-invalid={!!errors?.some((error) => error?.message)}>
      <FieldLabel htmlFor={id}>
        <FieldIcon icon={CalendarIcon} color="chart-3" />
        {label}
      </FieldLabel>
      <FieldContent>
        <div className="flex items-center gap-2">
          <InputGroup>
            <InputGroupInput
              id={id}
              value={inputValue}
              placeholder="dd/mm/aaaa"
              onChange={(event) => {
                setInputValue(event.target.value);
                if (!event.target.value) {
                  onChange("");
                  return;
                }
                const date = parseTypedDate(event.target.value);
                if (date) {
                  setMonth(date);
                  onChange(toISODate(date));
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setOpen(true);
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  render={
                    <InputGroupButton variant="ghost" size="icon-xs" aria-label="Selecionar data" />
                  }
                >
                  <CalendarIcon />
                  <span className="sr-only">Selecionar data</span>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="end"
                  alignOffset={-8}
                  sideOffset={10}
                >
                  <Calendar
                    mode="single"
                    selected={parseISODate(value)}
                    month={month}
                    onMonthChange={setMonth}
                    onSelect={(date) => {
                      onChange(date ? toISODate(date) : "");
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
          </InputGroup>
          {action}
        </div>
        <FieldError errors={errors} />
      </FieldContent>
    </Field>
  );
}
