import { APP_NAVIGATION } from "./navigation";
import { NavigationItem } from "./navigation-item";

export function MobileNavigation() {
  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-20 flex h-[72px] items-center justify-around border-t border-line bg-[#16140fF2] px-2 backdrop-blur-lg lg:hidden"
    >
      {APP_NAVIGATION.slice(0, 5).map((item) => (
        <NavigationItem item={item} key={item.label} mobile />
      ))}
    </nav>
  );
}
