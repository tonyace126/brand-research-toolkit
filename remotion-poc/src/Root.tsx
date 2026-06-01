import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { RhodesIntro, rhodesIntroSchema } from "./RhodesIntro";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // 羅德島總控風格 demo：npx remotion render RhodesIntro
        id="RhodesIntro"
        component={RhodesIntro}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
        schema={rhodesIntroSchema}
        defaultProps={{
          title: "羅德島總控",
          subtitle: "RHODES ISLAND // PROJECT COMMAND",
          completion: 76,
          briefing: "博士，今日作戰資料已同步完畢。",
          projects: [
            { name: "示範客戶 A — 品牌研究", pct: 92 },
            { name: "示範客戶 B — 輿情追蹤", pct: 68 },
            { name: "示範客戶 C — 影音企劃", pct: 45 },
          ],
        }}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
