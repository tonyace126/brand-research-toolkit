// =====================================================================
// 羅德島總控 // global.d.ts —— 讓 TS 認得 <image-slot> 自訂元素
// 放專案根（或 types/）任一被 tsconfig include 的位置即可。
// =====================================================================
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "image-slot": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        class?: string;
        shape?: "rect" | "rounded" | "circle" | "pill";
        radius?: string | number;
        placeholder?: string;
        fit?: "cover" | "contain" | "fill";
      };
    }
  }
}

export {};
