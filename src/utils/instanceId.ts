export const generateInstanceId = (): string => {
  return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSchemeId = (): string => {
  return `scheme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
