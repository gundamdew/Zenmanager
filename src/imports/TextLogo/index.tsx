import svgPaths from "./svg-du0u3suys5";

function Vector() {
  return (
    <div className="absolute h-[17.478px] left-0 top-0 w-[20px]" data-name="vector">
      <div className="absolute inset-[-5.72%_-5%_-5.74%_-5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 19.4809">
          <g id="vector">
            <path d={svgPaths.p3a480a80} fill="var(--fill-0, black)" fillOpacity="0.01" id="Vector" />
            <path d={svgPaths.p1064f600} fill="var(--fill-0, black)" fillOpacity="0.01" id="Vector_2" />
            <path d={svgPaths.p3a715d72} fill="var(--fill-0, black)" fillOpacity="0.01" id="Vector_3" />
            <path d={svgPaths.p1c02c880} fill="var(--fill-0, black)" fillOpacity="0.01" id="Vector_4" />
            <path d={svgPaths.p3a480a80} id="Vector_5" stroke="var(--stroke-0, #C4C4C4)" strokeOpacity="0.85" strokeWidth="2" />
            <path d={svgPaths.p1064f600} id="Vector_6" stroke="var(--stroke-0, #C4C4C4)" strokeOpacity="0.85" strokeWidth="2" />
            <path d={svgPaths.p3a715d72} id="Vector_7" stroke="var(--stroke-0, #C4C4C4)" strokeOpacity="0.85" strokeWidth="2" />
            <path d={svgPaths.p1c02c880} id="Vector_8" stroke="var(--stroke-0, #C4C4C4)" strokeOpacity="0.85" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function TextLogo() {
  return (
    <div className="contents relative size-full" style={{ containerType: "size" }} data-name="text logo">
      <Vector />
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-['EB_Garamond:ExtraBold',sans-serif] font-extrabold leading-[0] left-[43.5px] text-[0px] text-center text-white top-0 whitespace-nowrap">
        <span className="leading-[normal] text-[24px]">zen/s</span>
        <span className="font-['EB_Garamond:Bold_Italic',sans-serif] font-bold italic leading-[normal] text-[24px]">ync</span>
      </p>
    </div>
  );
}