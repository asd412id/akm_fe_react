export const sprintf = (format, ...args) => {
  let index = 0;
  return format.replace(/%[a-zA-Z]/g, match => {
    const arg = args[index++];
    switch (match) {
      case '%s':
        return String(arg);
      case '%d':
        return Number(arg);
      // add additional cases for other format specifiers as needed
      default:
        return match;
    }
  });
}

export const imgTags = (html) => {
  return html?.match(/<img [^>]*src="[^"]*"[^>]*>/gm) ?? [];
};

export const imgSrcs = (html) => {
  return html?.match(/<img [^>]*src="[^"]*"[^>]*>/gm)?.map(x => x.replace(/.*src="([^"]*)".*/, '$1')) ?? [];
}

export const getBuffer = (base64Data) => {
  return base64Data?.replace(/^data:image\/[a-z]+;base64,/, "");
}

export const base64Extension = (base64Data) => {
  return base64Data?.split(';')[0].split('/')[1] ?? null;
};

export const generateColor = (str, alpha = 1) => {
  var rgb = [0, 0, 0];
  for (var i = 0; i < str.length; i++) {
    var v = str.charCodeAt(i);
    rgb[v % 3] = (rgb[i % 3] + (13 * (v % 13))) % 12;
  }
  var r = 4 + rgb[1];
  var g = 4 + rgb[2];
  var b = 4 + rgb[0];
  r = (r * 16) + r;
  g = (g * 16) + g;
  b = (b * 16) + b;
  var color = [r, g, b];
  return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')';
};

export const numberRange = (start, end) => {
  return new Array(end - start + 1).fill().map((d, i) => i + start);
}
export const alphabetRange = (start, end) => {
  return new Array(end.charCodeAt(0) - start.charCodeAt(0) + 1).fill().map((d, i) => String.fromCharCode(i + start.charCodeAt(0)));
}

export const parseNumber = (number) => {
  const val = String(number).replace(/,/g, '.').replace(/[^0-9.]/g, '');
  return val === '' || (!String(val).includes('.') && isNaN(parseFloat(val))) ? 0 : (String(val).startsWith('0') && !String(val).startsWith('0.') ? parseInt(val) : (String(val).split('.').length - 1 > 1 || String(val).split(',').length - 1 > 0) ? parseFloat(val) : val)
}

export const handleDownload = (path, name) => {
  const url = path;
  const fileName = name;
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
};

export const argbToRgb = (argb) => {
  if (typeof argb !== 'string' || argb.length !== 8 || !/^[0-9a-fA-F]{8}$/.test(argb)) {
    // Return a default value or throw an error
    return 'rgb(0, 0, 0)';
  }

  const alpha = parseInt(argb.substring(0, 2), 16) / 255;
  const red = parseInt(argb.substring(2, 4), 16);
  const green = parseInt(argb.substring(4, 6), 16);
  const blue = parseInt(argb.substring(6, 8), 16);
  const r = Math.round((1 - alpha) * 255 + alpha * red);
  const g = Math.round((1 - alpha) * 255 + alpha * green);
  const b = Math.round((1 - alpha) * 255 + alpha * blue);
  return `rgb(${r}, ${g}, ${b})`;
}


export const excelRichTexttoHtml = (richText) => {
  let html = '';
  richText.forEach((text) => {
    if (text.text) {
      const style = text.font;
      const textContent = text.text;
      let st = 0;
      let styles = '';

      if (style?.bold) {
        st = 1;
        styles = styles === '' ? textContent : styles;
        styles = sprintf('<strong>%s</strong>', styles);
      }
      if (style?.italic) {
        st = 1;
        styles = styles === '' ? textContent : styles;
        styles = sprintf('<em>%s</em>', styles);
      }
      if (style?.underline) {
        st = 1;
        styles = styles === '' ? textContent : styles;
        styles = sprintf('<u>%s</u>', styles);
      }
      if (style?.strikethrough) {
        st = 1;
        styles = styles === '' ? textContent : styles;
        styles = sprintf('<strike>%s</strike>', styles);
      }
      if (style?.color?.argb !== undefined && style?.color?.argb !== 'FF000000') {
        st = 1;
        styles = styles === '' ? textContent : styles;
        styles = sprintf(`<span style="color: ${argbToRgb(style?.color?.argb)}">%s</span>`, styles);
      }
      if (style?.vertAlign === 'superscript') {
        st = 1;
        styles = styles === '' ? textContent : styles;
        styles = sprintf('<sup>%s</sup>', styles);
      }
      if (style?.vertAlign === 'subscript') {
        st = 1;
        styles = styles === '' ? textContent : styles;
        styles = sprintf('<sub>%s</sub>', styles);
      }

      if (!st) {
        html += textContent;
      }
      html += styles;
    }
  });

  return html;
}

export const extractImageFromExcel = (workbook, worksheet) => {
  const images = [];
  for (const image of worksheet.getImages()) {
    // fetch the media item with the data (it seems the imageId matches up with m.index?)
    const img = workbook.model.media.find(m => m.index === image.imageId);
    const base64Image = img.buffer.toString('base64')
    images.push({
      base64Data: base64Image,
      name: img.name,
      extension: img.extension,
      range: image.range
    });
  }
  return images;
}