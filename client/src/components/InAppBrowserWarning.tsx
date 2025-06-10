// components/InAppBrowserWarning.tsx
import React from "react";
import { isInAppBrowser } from "../utils/IsInAppBrowser";

const InAppBrowserWarning: React.FC = () => {
  if (typeof window === "undefined") return null; // Prevent SSR errors

  if (!isInAppBrowser()) return null;

  return (
    <div className=" border-l-4 bg-white border-[#83A99B] text-[#2F5A62] p-4 my-4 rounded-lg text-center max-w-md mx-auto">
      <strong>Google Login may not work in this browser.</strong>
      <br />
      Please tap the <b>three dots menu</b> or <b>share icon</b> and choose{" "}
      <b>“Open in Browser”</b> (e.g., Chrome, Safari).
      <br />
      <br />
      This is a limitation of in-app browsers like LinkedIn, Facebook,
      Instagram, and others.
    </div>
  );
};

export default InAppBrowserWarning;
