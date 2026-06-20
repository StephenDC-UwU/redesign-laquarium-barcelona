const dictionaries = {
  "en": () => import("./en").then((module) => module.en),
  "es": () => import("./es").then((module) => module.es),
  "ca": () => import("./ca").then((module) => module.ca),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries["es"]>>;

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const load = dictionaries[locale as keyof typeof dictionaries];
  if (!load) {
    return dictionaries["es"]();
  }
  return load();
};
