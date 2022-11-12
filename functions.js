function deepen(obj) {
  const result = {};

  // For each object path (property key) in the object
  for (const objectPath in obj) {
    // Split path into component parts
    const parts = objectPath.split('.');

    // Create sub-objects along path as needed
    let target = result;
    while (parts.length > 1) {
      const part = parts.shift();
      target = target[part] = target[part] || {};
    }

    // Set value at end of path
    target[parts[0]] = obj[objectPath];
  }

  return result;
}

function createArray({ dictionary, platform }) {
  const arr = dictionary.allTokens;
  return JSON.stringify(arr);
}

function adjustCase(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function adjustSpecialChars(string) {
  string = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return string.split(' ').join('');
}

function adjustNameProp(string) {
  return adjustCase(adjustSpecialChars(string));
}

const ROOT_PROP = {
  colors: 'colors',
  fontSizes: 'fontSizes',
  fontWeights: 'fontWeights',
  lineHeights: 'lineHeights',
  letterSpacings: 'letterSpacings',
  fontFamilies: 'fontFamilies'
};

const IGNORED_KEYS = {
  colors: ['coolGray', 'rose'],
  typography: ['componentHeadingLarge', 'textXs', 'textSm', 'textXxs']
}

const NAME_TRANSFORMER = {
  typography: {
    componentText: 'component-text',
    componentHeading: 'component-heading',
    textLayer: 'text-layer'
  }
}

function getMappedRootProperty(propName) {
  if (propName === 'color') {
    return ROOT_PROP.colors;
  }

  if (propName === 'fontSize') {
    return ROOT_PROP.fontSizes;
  }

  if (propName === 'fontWeight') {
    return ROOT_PROP.fontWeights;
  }

  if (propName === 'lineHeight') {
    return ROOT_PROP.lineHeights;
  }

  if (propName === 'letterSpacing') {
    return ROOT_PROP.letterSpacings;
  }

  if (propName === 'fontFamily') {
    return ROOT_PROP.fontFamilies;
  }

  return propName;
}

const fixValueTypeCase = (val) => {
  if (typeof val === 'string') {
    return val.toLowerCase();
  }

  return val;
};

function adjustTypographyProps(rule) {
  Object.keys(rule).forEach(key => {
    rule[key] = fixValueTypeCase(rule[key]);
  });

  if (rule.lineHeight) {
    if (
      typeof rule.lineHeight === 'string' &&
      rule.lineHeight === 'auto'
    ) {
      rule.lineHeight = '100%';
    }

    if (typeof rule.lineHeight === 'number') {
      rule.lineHeight = rule.lineHeight + 'px';
    }
  }

  if (
    rule.letterSpacing &&
    typeof rule.letterSpacing === 'string' &&
    rule.letterSpacing === '0%'
  ) {
    rule.letterSpacing = 'normal';
  }

  if (
    rule.fontWeight &&
    typeof rule.fontWeight === 'string' &&
    rule.fontWeight === 'regular'
  ) {
    rule.fontWeight = '400';
  }

  if (rule.textCase) {
    rule.textTransform = rule.textCase;
    delete rule.textCase;
  }

  delete rule.paragraphSpacing;

  return rule;
}

function createFlatObject({ dictionary }) {
  const arr = dictionary.allTokens;
  const reduced = arr.reduce((acc, cur) => {
    const propType = getMappedRootProperty(cur.type);
    // let name = adjustNameProp(cur.path[0] || cur.name);
    let name = adjustNameProp(cur.name);

    if ((propType === 'typography' || propType === 'custom-fontStyle') && cur.attributes.category) {
      console.log('propType', propType, name, cur);
      // 1°
      let category = adjustNameProp(cur.attributes.category || '');
      
      if (IGNORED_KEYS.typography.indexOf(category) !== -1) {
        return acc;
      }

      if (NAME_TRANSFORMER.typography[category]) {
        category = NAME_TRANSFORMER.typography[category];
      }

      // 2°
      let type = adjustNameProp(cur.attributes.type || '');
      // 3°
      let item = adjustNameProp(cur.attributes.item || '');

      acc[category] =  acc[category] || {};
      const val = adjustTypographyProps(cur.value);

      if (item && type) {
        let composedName = [type, item].join('-');
        acc[category][composedName] = val;
        return acc;
      }

      if (type) {
        acc[category][type] = val;
        return acc;
      }

      if (item) {
        acc[category][item] = val;
        return acc;
      }
    }

    if (propType === ROOT_PROP.colors) {
      // const keyParts = cur.path[0].split(' ');
      const keyParts = cur.path;

      name = adjustNameProp(keyParts[0]);

      if (IGNORED_KEYS.colors.indexOf(name) !== -1) {
        return acc;
      }  

      acc[propType] =  acc[propType] || {};
      
      if (keyParts.length === 1) {
        acc[propType][name] = cur.value;
        return acc;
      }

      name = adjustNameProp(keyParts[0]);
      acc[propType][name] = acc[propType][name] || {};
      acc[propType][name][(adjustNameProp(keyParts[1]))] = cur.value;
      return acc;
    }

    acc[propType] =  acc[propType] || {};
    acc[propType][name] = cur.value;
    return acc;
  }, {});
  return JSON.stringify(reduced, null, 2);
}

function filterTokensByType(type, tokens) {
  const obj = tokens.reduce((acc, cur) => {
    return acc;
  }, {});

  return obj;
}

module.exports = { createArray, filterTokensByType, createFlatObject };
