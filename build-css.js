const path = require('path')
const fs = require('fs')

const cssPrefix = 'one'
const srcPath = 'output'

fs.readdir(path.resolve(__dirname, srcPath), (err, files) => {
  if (err) throw err

  for (let file of files) {
    if (file.indexOf('.json') !== -1) {
      transformJsonToCss(file)
    }
  }
})

function createCssVar (color, colorName, prefix) {
  prefix = prefix || ''
  if (typeof color === 'string') {
    return `  --${cssPrefix}${cssPrefix ? '-' : ''}${
      prefix ? `${prefix}-` : ''
    }${colorName}: ${color};\n`
  }

  if (typeof color === 'object') {
    let _var = ''
    Object.keys(color).forEach(name => {
      const subColor = color[name]
      _var += createCssVar(
        subColor,
        name,
        `${prefix ? `${prefix}-` : ''}${colorName}`
      )
    })

    return _var
  }
}

function transformJsonToCss (fileName) {
  console.log(fileName)

  const outputFilePath = path.resolve(__dirname, srcPath, fileName)
  const destFilePath = path.resolve(
    __dirname,
    srcPath + '/css',
    fileName.replace('.json', '.css')
  )

  try {
    const fileData = JSON.parse(fs.readFileSync(outputFilePath, 'utf8') || '')

    // console.log(fileData);

    let colorVars = ''

    Object.keys(fileData.colors).forEach(colorName => {
      const color = fileData.colors[colorName]
      colorVars += createCssVar(color, colorName)
    })

    let theme = `:root {\n${colorVars}}\n`

    if (fileData['text-layer']) {
      const textLayerData = fileData['text-layer']
      Object.keys(textLayerData).forEach(layerName => {
        if (typeof textLayerData[layerName] === 'object') {
          theme += createTypoStyle(
            'text-layer',
            layerName,
            textLayerData[layerName]
          )
        }
      })
    }

    if (fileData['component-heading']) {
      const headings = fileData['component-heading']
      Object.keys(headings).forEach(name => {
        if (typeof headings[name] === 'object') {
          theme += createTypoStyle('heading', name, headings[name])
        }
      })
    }

    if (fileData['component-text']) {
      const texts = fileData['component-text']
      Object.keys(texts).forEach(name => {
        if (typeof texts[name] === 'object') {
          theme += createTypoStyle('text', name, texts[name]);
        }
      })
    }

    fs.writeFileSync(destFilePath, theme, { flag: 'w+' });

    console.log(`${destFilePath} file created!`);
  } catch (err) {
    console.error(err)
  }
}

function createTypoStyle (type, name, data) {
  let style = ''
  if (data.fontSize) {
    style += '  font-size: ' + data.fontSize + 'px' + ';\n'
  }
  if (data.textDecoration) {
    style += '  text-decoration: ' + data.textDecoration + ';\n'
  }
  if (data.fontFamily) {
    style += '  font-family: ' + `"${fixFontFaceName(data.fontFamily)}"` + ';\n'
  }
  if (data.fontWeight) {
    style += '  font-weight: ' + data.fontWeight + ';\n'
  }
  if (data.fontStyle) {
    style += '  font-style: ' + data.fontStyle + ';\n'
  }
  if (data.letterSpacing) {
    style += '  letter-spacing: ' + data.letterSpacing + ';\n'
  }
  if (data.lineHeight) {
    style += '  line-height: ' + data.lineHeight + ';\n'
  }
  if (data.textTransform) {
    style += '  text-transform: ' + data.textTransform + ';\n'
  }
  return `[${cssPrefix ? `${cssPrefix}-` : ''}${type}="${name}"] {\n${style}}\n`
}

function fixFontFaceName(name) {
    let words = name.split(" ");

    return words.map((word) => { 
        return word[0].toUpperCase() + word.substring(1); 
    }).join(" ");
}