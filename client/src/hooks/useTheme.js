import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme as toggleThemeAction } from "@/features/theme/themeSlice";

export function useTheme() {
  const isDark = useSelector((state) => state.theme.isDark);
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("light", !isDark);
  }, [isDark]);

  return {
    isDark,
    toggleTheme: () => dispatch(toggleThemeAction()),
  };
}
