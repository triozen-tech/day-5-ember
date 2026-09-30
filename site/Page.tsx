import MenuCardNav from "./components/MenuCardNav";
import SteamHero from "./components/SteamHero";
import SlowStatement from "./components/SlowStatement";
import OriginArches from "./components/OriginArches";
import RoastDial from "./components/RoastDial";
import ThePour from "./components/ThePour";
import MenuBoard from "./components/MenuBoard";
import BakeShelf from "./components/BakeShelf";
import BeanBags from "./components/BeanBags";
import StayAWhile from "./components/StayAWhile";
import ClubAndNotes from "./components/ClubAndNotes";
import EmberFooter from "./components/EmberFooter";
import SiteFlags from "./components/SiteFlags";
import LatteLoader from "./components/LatteLoader";
import Transitions from "./components/Transitions";
import GhostCursor from "./components/GhostCursor";
import { faviconSvg } from "./components/Logo";
import { meta } from "./site";

const ICON = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;

/** Ember Roast: a slow morning at the café, told through the coffee itself. Plan + Motion map: site/DESIGN.md. */
export default function Page() {
  return (
    <>
      {/* never restore the old scroll position on reload · cover the page as it unloads so a
          reload never flashes the old page · ?record=1: hide the mouse arrow from the first frame */}
      <script
        dangerouslySetInnerHTML={{
          __html: `history.scrollRestoration="manual";addEventListener("pagehide",function(){var c=document.createElement("div");c.style.cssText="position:fixed;inset:0;z-index:2147483647;background:#1b120c";document.body.appendChild(c)});addEventListener("pageshow",function(e){if(e.persisted)location.reload()});if(/[?&]record/.test(location.search)){var s=document.createElement("style");s.textContent="*,*::before,*::after{cursor:none!important}html{scrollbar-width:none}html::-webkit-scrollbar{display:none}";document.head.appendChild(s)}`,
        }}
      />
      <link rel="icon" type="image/svg+xml" href={ICON} />
      <SiteFlags />
      <LatteLoader name={meta.loaderText ?? meta.name} />
      <Transitions />
      <GhostCursor />
      <MenuCardNav />
      <main className="relative overflow-x-clip">
        <SteamHero />
        <SlowStatement />
        <OriginArches />
        <RoastDial />
        <ThePour />
        <MenuBoard />
        <BakeShelf />
        <BeanBags />
        <StayAWhile />
        <ClubAndNotes />
      </main>
      <EmberFooter />
    </>
  );
}
