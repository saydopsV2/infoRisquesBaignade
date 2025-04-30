// Fonction pour extraire les types de marées (BM/PM)
export const extractTideTypes = (typeString: string): string[] => {
  const types: string[] = [];
  for (let i = 0; i < typeString.length; i += 2) {
    if (i + 2 <= typeString.length) {
      const type = typeString.substring(i, i + 2);
      types.push(type);
    }
  }
  return types;
};

// Fonction pour formater les heures de marées
export const formatTideHours = (hoursString: string): string[] => {
  const result: string[] = [];
  for (let i = 0; i < hoursString.length; i += 5) {
    if (i + 5 <= hoursString.length) {
      result.push(hoursString.substring(i, i + 5));
    }
  }
  return result;
};

// Fonction pour formater les hauteurs de marées
export const formatTideHeights = (heightsString: string): string[] => {
  const result: string[] = [];
  for (let i = 0; i < heightsString.length; i += 5) {
    if (i + 5 <= heightsString.length) {
      result.push(heightsString.substring(i, i + 5));
    }
  }
  return result;
};
