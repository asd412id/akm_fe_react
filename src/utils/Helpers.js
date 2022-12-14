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