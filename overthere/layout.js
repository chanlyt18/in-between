// The original 1000×870 camera is never stretched. Extra horizontal room is
// real world space on both sides of its unchanged circular data band.
import {W,H} from './engine.js';
export function createLayout(width,height){const unit=height/H,worldWidth=width/unit,extra=Math.max(0,worldWidth-W);return{cssWidth:width,cssHeight:height,unit,worldWidth,worldHeight:H,offsetX:extra*.48};}
