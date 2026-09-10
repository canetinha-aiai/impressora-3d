import { useEffect, useRef } from "react";

export default function ModelViewer({ src, interactive = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (src) el.setAttribute("src", src);
    else el.removeAttribute("src");
  }, [src]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (interactive) el.setAttribute("camera-controls", "");
    else el.removeAttribute("camera-controls");
  }, [interactive]);

  return (
    <model-viewer
      ref={ref}
      disable-zoom=""
      auto-rotate=""
      auto-rotate-delay="0"
      rotation-per-second="24deg"
      shadow-intensity="1"
      exposure="1"
      interaction-prompt="none"
    ></model-viewer>
  );
}
