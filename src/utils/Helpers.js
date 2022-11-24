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