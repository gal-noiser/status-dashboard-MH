"use client";

export function ClosePopoverButton() {
  return (
    <button
      type="button"
      aria-label="סגור"
      onClick={(e) => {
        e.currentTarget.closest("details")?.removeAttribute("open");
      }}
      className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[#898781] hover:bg-black/5 hover:text-[#52514e]"
    >
      ×
    </button>
  );
}
