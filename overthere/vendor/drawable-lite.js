/* Adapted from Anime.js src/svg/drawable.js, Julian Garnier, MIT.
 * https://github.com/juliangarnier/anime/blob/master/src/svg/drawable.js
 * Full licence in ../LICENSES.txt. This small adapter retains normalized
 * SVG pathLength / dash interval math, without the proxy or animation engine.
 */
export const NORMALIZED_LENGTH=1000;
export function prepareDrawable(el){el.setAttribute('pathLength',String(NORMALIZED_LENGTH));el.setAttribute('stroke-dasharray','0 1010');el.setAttribute('stroke-dashoffset','0');el.style.visibility='hidden';}
export function drawInterval(el,start,end){const a=Math.max(0,Math.min(1,start)),b=Math.max(0,Math.min(1,end));const offset=-a*NORMALIZED_LENGTH;const visible=Math.max(0,b*NORMALIZED_LENGTH+offset);const gap=NORMALIZED_LENGTH+10-visible;el.setAttribute('stroke-dashoffset',String(offset));el.setAttribute('stroke-dasharray',`${visible} ${gap}`);el.style.visibility=visible>0?'visible':'hidden';}
