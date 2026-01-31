import { sourceColorFromImage, themeFromSourceColor, applyTheme } from "@material/material-color-utilities";

export const useDynamicTheme = () => {
  const updateTheme = async (imgUrl: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;
    img.onload = async () => {
      const color = await sourceColorFromImage(img);
      const theme = themeFromSourceColor(color);
      applyTheme(theme, { target: document.documentElement, dark: true });
    };
  };
  return { updateTheme };
};
