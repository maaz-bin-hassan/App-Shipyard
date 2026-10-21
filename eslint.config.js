import tseslint from "typescript-eslint";

export default tseslint.config({
  files: [
    "platforms/expo/template/src/lib/**/*.ts",
    "platforms/expo/template/src/ui/**/*.ts",
    "platforms/expo/template/src/theme/**/*.ts",
    "platforms/expo/template/src/data/**/*.ts",
    "platforms/expo/template/src/design/**/*.ts",
    "platforms/expo/template/src/i18n/**/*.ts",
    "platforms/expo/template/src/legal/**/*.ts",
    "platforms/expo/template/src/features/ai/**/*.ts",
    "platforms/expo/template/src/features/permissions/**/*.ts",
    "platforms/expo/template/src/features/settings/**/*.ts",
    "backend/supabase/functions/ai-proxy/handler.ts",
  ],
  extends: [tseslint.configs.recommended],
});
