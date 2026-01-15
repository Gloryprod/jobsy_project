"use client";
import PhoneInputLib, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  const isValid = value ? isValidPhoneNumber(value) : true;

  return (
    <div>
      <PhoneInputLib
        international
        defaultCountry="BJ"
        value={value}
        onChange={(val) => onChange(val || "")}
        className="bg-white/10 text-black text-sm rounded-xl block w-full h-10 p-2.5 dark:text-white"
      />
      {!isValid && (
        <p className="text-red-500 text-xs mt-1">Numéro de téléphone invalide</p>
      )}
    </div>
  );
}
