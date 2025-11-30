import { fireEvent, render, screen } from "@testing-library/react";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NomenclatureAttributesForm } from "../NomenclatureAttributesForm";

const SCHEMA = {
  type: "object",
  properties: {
    power: { type: "number", title: "Мощность", "x-unit": "кВт", "x-group": "Паспорт" },
    protection: {
      type: "string",
      title: "Класс защиты",
      enum: ["IP54", "IP65"],
      "x-group": "Паспорт",
    },
    mounting: {
      type: "array",
      title: "Способ монтажа",
      items: {
        type: "string",
        enum: ["фланец", "лапа", "стойка"],
      },
      "x-group": "Паспорт",
    },
  },
} as const;

const renderHarness = (initialValues: Record<string, string | number | null | string[]>) => {
  const changeSpy = vi.fn();
  function Harness() {
    const [values, setValues] = useState<Record<string, string | number | null | string[]>>(
      initialValues
    );
    return (
      <NomenclatureAttributesForm
        schema={SCHEMA}
        values={values}
        onChange={(next) => {
          setValues(next);
          changeSpy(next);
        }}
      />
    );
  }
  return { changeSpy, ...render(<Harness />) };
};

describe("NomenclatureAttributesForm", () => {
  it("рендерит поля по схеме и прокидывает значения", () => {
    const { changeSpy } = renderHarness({ power: 7 });

    const powerInput = screen.getByLabelText("Мощность");
    fireEvent.change(powerInput, { target: { value: "12.5" } });

    expect(changeSpy).toHaveBeenLastCalledWith({ power: 12.5 });

    const select = screen.getByLabelText("Класс защиты");
    fireEvent.change(select, { target: { value: "IP65" } });

    expect(changeSpy).toHaveBeenLastCalledWith({ power: 12.5, protection: "IP65" });
  });

  it("удаляет ключ при очистке значения", () => {
    const { changeSpy } = renderHarness({ power: 10, protection: "IP54" });

    const powerInput = screen.getByLabelText("Мощность");
    fireEvent.change(powerInput, { target: { value: "" } });

    expect(changeSpy).toHaveBeenLastCalledWith({ protection: "IP54" });
  });

  it("поддерживает поля-массивы с multiselect", () => {
    const { changeSpy } = renderHarness({ mounting: ["лапа"] });

    const select = screen.getByLabelText("Способ монтажа") as HTMLSelectElement;
    expect(select.multiple).toBe(true);

    fireEvent.change(select, {
      target: {
        selectedOptions: [
          { value: "фланец" },
          { value: "стойка" },
        ],
      },
    });

    expect(changeSpy).toHaveBeenLastCalledWith({
      mounting: ["фланец", "стойка"],
    });
  });
});
