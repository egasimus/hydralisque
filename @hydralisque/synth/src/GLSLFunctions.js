/*
Format for adding functions to hydra. For each entry in this file, hydra automatically generates a glsl function and javascript function with the same name. You can also ass functions dynamically using setFunction(object).

{
  name: 'osc', // name that will be used to access function in js as well as in glsl
  type: 'src', // can be 'src', 'color', 'combine', 'combineCoords'. see below for more info
  inputs: [
    {
      name: 'freq',
      type: 'float',
      default: 0.2
    },
    {
      name: 'sync',
      type: 'float',
      default: 0.1
    },
    {
      name: 'offset',
      type: 'float',
      default: 0.0
    }
  ],
    glsl: `
      vec2 st = _st;
      float r = sin((st.x-offset*2/freq+time*sync)*freq)*0.5  + 0.5;
      float g = sin((st.x+time*sync)*freq)*0.5 + 0.5;
      float b = sin((st.x+offset/freq+time*sync)*freq)*0.5  + 0.5;
      return vec4(r, g, b, 1.0);
   `
}

// The above code generates the glsl function:
`vec4 osc(vec2 _st, float freq, float sync, float offset){
 vec2 st = _st;
 float r = sin((st.x-offset*2/freq+time*sync)*freq)*0.5  + 0.5;
 float g = sin((st.x+time*sync)*freq)*0.5 + 0.5;
 float b = sin((st.x+offset/freq+time*sync)*freq)*0.5  + 0.5;
 return vec4(r, g, b, 1.0);
}`
Types and default arguments for hydra functions.
The value in the 'type' field lets the parser know which type the function will be returned as well as default arguments.

const types = {
  'src': {
    returnType: 'vec4',
    args: ['vec2 _st']
  },
  'coord': {
    returnType: 'vec2',
    args: ['vec2 _st']
  },
  'color': {
    returnType: 'vec4',
    args: ['vec4 _c0']
  },
  'combine': {
    returnType: 'vec4',
    args: ['vec4 _c0', 'vec4 _c1']
  },
  'combineCoord': {
    returnType: 'vec2',
    args: ['vec2 _st', 'vec4 _c0']
  }
}

*/

module.exports =
module.exports =

[ Fn('noise', 'src'
    , [ { type: 'float', name: 'scale',  default: 10  }
      , { type: 'float', name: 'offset', default: 0.1 } ]
    , `return vec4(vec3(_noise(vec3(_st*scale, offset*time))), 1.0);`)

, Fn('voronoi', 'src'
    , [ { type: 'float', name: 'scale',    default: 5   }
      , { type: 'float', name: 'speed',    default: 0.3 }
      , { type: 'float', name: 'blending', default: 0.3 } ]
    , `
      vec3 color = vec3(.0);
      // Scale
      _st *= scale;
      // Tile the space
      vec2 i_st = floor(_st);
      vec2 f_st = fract(_st);
      float m_dist = 10.;  // minimun distance
      vec2 m_point;        // minimum point
      for (int j=-1; j<=1; j++ ) {
      for (int i=-1; i<=1; i++ ) {
      vec2 neighbor = vec2(float(i),float(j));
      vec2 p = i_st + neighbor;
      vec2 point = fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
      point = 0.5 + 0.5*sin(time*speed + 6.2831*point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      if( dist < m_dist ) {
      m_dist = dist;
      m_point = point;
      }
      }
      }
      // Assign a color using the closest point position
      color += dot(m_point,vec2(.3,.6));
      color *= 1.0 - blending*m_dist;
      return vec4(color, 1.0);`)

, Fn('osc', 'src'
    , [ { type: 'float', name: 'frequency', default: 60,  }
      , { type: 'float', name: 'sync',      default: 0.1, }
      , { type: 'float', name: 'offset',    default: 0,   } ]
    , `
      vec2 st = _st;
      float r = sin((st.x-offset/frequency+time*sync)*frequency)*0.5  + 0.5;
      float g = sin((st.x+time*sync)*frequency)*0.5 + 0.5;
      float b = sin((st.x+offset/frequency+time*sync)*frequency)*0.5  + 0.5;
      return vec4(r, g, b, 1.0);`
    )

, Fn('shape', 'src'
    , [ { type: 'float', name: 'sides',     default: 3    }
      , { type: 'float', name: 'radius',    default: 0.3  }
      , { type: 'float', name: 'smoothing', default: 0.01 } ]
    , `
      vec2 st = _st * 2. - 1.;
      // Angle and radius from the current pixel
      float a = atan(st.x,st.y)+3.1416;
      float r = (2.*3.1416)/sides;
      float d = cos(floor(.5+a/r)*r-a)*length(st);
      return vec4(vec3(1.0-smoothstep(radius,radius + smoothing,d)), 1.0);`
    )

, Fn('gradient', 'src'
    , [ { type: 'float', name: 'speed', default: 0, } ]
    , `   return vec4(_st, sin(time*speed), 1.0);`
    )

, Fn('src', 'src'
    , [ { type: 'sampler2D', name: 'tex', default: NaN, } ]
    , `   //  vec2 uv = gl_FragCoord.xy/vec2(1280., 720.);
       return texture2D(tex, fract(_st));`
    )

, Fn('solid', 'src',
    [ { type: 'float', name: 'r', default: 0 }
    , { type: 'float', name: 'g', default: 0 }
    , { type: 'float', name: 'b', default: 0 }
    , { type: 'float', name: 'a', default: 1 } ],
    `return vec4(r, g, b, a);`)
	
, Fn('rotate', 'coord',
    [ { type: 'float', name: 'angle', default: 10, }
    , { type: 'float', name: 'speed', default: 0,  } ],
    `vec2 xy = _st - vec2(0.5);
     float ang = angle + speed *time;
     xy = mat2(cos(ang),-sin(ang), sin(ang),cos(ang))*xy;
     xy += 0.5;
     return xy;`)
	
, Fn('scale', 'coord',
    [ { type: 'float', name: 'amount', default: 1.5, }
    , { type: 'float', name: 'xMult', default: 1, }
    , { type: 'float', name: 'yMult', default: 1, }
    , { type: 'float', name: 'offsetX', default: 0.5, }
    , { type: 'float', name: 'offsetY', default: 0.5, }
    ],
    `vec2 xy = _st - vec2(offsetX, offsetY);
     xy*=(1.0/vec2(amount*xMult, amount*yMult));
     xy+=vec2(offsetX, offsetY);
     return xy;`)

, Fn('pixelate', 'coord',
    [ { type: 'float', name: 'pixelX', default: 20, }
    , { type: 'float', name: 'pixelY', default: 20, } ],
   `vec2 xy = vec2(pixelX, pixelY);
    return (floor(_st * xy) + 0.5)/xy;`)

, Fn('posterize', 'color',
    [ { type: 'float', name: 'bins', default: 3, }
    , { type: 'float', name: 'gamma', default: 0.6, }],
    `vec4 c2 = pow(_c0, vec4(gamma));
     c2 *= vec4(bins);
     c2 = floor(c2);
     c2/= vec4(bins);
     c2 = pow(c2, vec4(1.0/gamma));
     return vec4(c2.xyz, _c0.a);`)

, Fn('shift', 'color',
    [ { type: 'float', name: 'r', default: 0.5, }
    , { type: 'float', name: 'g', default: 0    }
    , { type: 'float', name: 'b', default: 0,   }
    , { type: 'float', name: 'a', default: 0,   } ],
    `vec4 c2 = vec4(_c0);
     c2.r = fract(c2.r + r);
     c2.g = fract(c2.g + g);
     c2.b = fract(c2.b + b);
     c2.a = fract(c2.a + a);
     return vec4(c2.rgba);`)
	
, Fn('repeat', 'coord',
    [ { type: 'float', name: 'repeatX', default: 3, }
    , { type: 'float', name: 'repeatY', default: 3, }
    , { type: 'float', name: 'offsetX', default: 0, }
    , { type: 'float', name: 'offsetY', default: 0, } ],
    `vec2 st = _st * vec2(repeatX, repeatY);
     st.x += step(1., mod(st.y,2.0)) * offsetX;
     st.y += step(1., mod(st.x,2.0)) * offsetY;
     return fract(st);`)	

, Fn('modulateRepeat', 'combineCoord',
    [ { type: 'float', name: 'repeatX', default: 3, }
    , { type: 'float', name: 'repeatY', default: 3, }
    , { type: 'float', name: 'offsetX', default: 0.5, }
    , { type: 'float', name: 'offsetY', default: 0.5, } ],
    `vec2 st = _st * vec2(repeatX, repeatY);
     st.x += step(1., mod(st.y,2.0)) + _c0.r * offsetX;
     st.y += step(1., mod(st.x,2.0)) + _c0.g * offsetY;
     return fract(st);`)

, Fn('repeatX', 'coord',
    [ { type: 'float', name: 'reps',   default: 3 }
    , { type: 'float', name: 'offset', default: 0 } ],
    `vec2 st = _st * vec2(reps, 1.0);    //  float f =  mod(_st.y,2.0);
     st.y += step(1., mod(st.x,2.0))* offset;
     return fract(st);`)

, Fn('modulateRepeatX', 'combineCoord',
    [ { type: 'float', name: 'reps', default: 3, }
    , { type: 'float', name: 'offset', default: 0.5, } ],
    `vec2 st = _st * vec2(reps, 1.0);
     //  float f =  mod(_st.y,2.0);
     st.y += step(1., mod(st.x,2.0)) + _c0.r * offset;
     return fract(st);`)
	
, Fn('repeatY', 'coord',
    [ { type: 'float', name: 'reps',   default: 3, }
    , { type: 'float', name: 'offset', default: 0, } ],
    `vec2 st = _st * vec2(1.0, reps);
     //  float f =  mod(_st.y,2.0);
     st.x += step(1., mod(st.y,2.0))* offset;
     return fract(st);`)

, Fn('modulateRepeatY', 'combineCoord',
    [ { type: 'float', name: 'reps',   default: 3,   }
    , { type: 'float', name: 'offset', default: 0.5, } ],
    `vec2 st = _st * vec2(reps, 1.0);
     //  float f =  mod(_st.y,2.0);
     st.x += step(1., mod(st.y,2.0)) + _c0.r * offset;
     return fract(st);`)

, Fn('kaleid', 'coord',
    [ { type: 'float',  name: 'nSides',  default: 4,} ],
    `vec2 st = _st;
     st -= 0.5;
     float r = length(st);
     float a = atan(st.y, st.x);
     float pi = 2.*3.1416;
     a = mod(a,pi/nSides);
     a = abs(a-pi/nSides/2.);
     return r*vec2(cos(a), sin(a));`)
	
, Fn('modulateKaleid', 'combineCoord',
    [ { type: 'float', name: 'nSides', default: 4, } ],
    `vec2 st = _st - 0.5;
     float r = length(st);
     float a = atan(st.y, st.x);
     float pi = 2.*3.1416;
     a = mod(a,pi/nSides);
     a = abs(a-pi/nSides/2.);
     return (_c0.r+r)*vec2(cos(a), sin(a));`)

, Fn('scroll', 'coord',
    [ { type: 'float', name: 'scrollX', default: 0.5, }
    , { type: 'float', name: 'scrollY', default: 0.5, }
    , { type: 'float', name: 'speedX',  default: 0,   }
    , { type: 'float', name: 'speedY',  default: 0,   } ],
    `_st.x += scrollX + time*speedX;
     _st.y += scrollY + time*speedY;
     return fract(_st);`)

, Fn('scrollX', 'coord',
    [ { type: 'float', name: 'scrollX', default: 0.5, }
    , { type: 'float', name: 'speed',   default: 0,   } ],
    `_st.x += scrollX + time*speed;
    return fract(_st);`)

, Fn('modulateScrollX', 'combineCoord',
    [ { type: 'float', name: 'scrollX', default: 0.5, }
    , { type: 'float', name: 'speed',   default: 0,   } ],
    `_st.x += _c0.r*scrollX + time*speed;
     return fract(_st);`)
	
, Fn('scrollY', 'coord',
    [ { type: 'float',  name: 'scrollY',  default: 0.5,  }
    , {  type: 'float',  name: 'speed',  default: 0,  }   ],
    `_st.y += scrollY + time*speed;
     return fract(_st);`)

, Fn('modulateScrollY', 'combineCoord',
    [ { type: 'float',  name: 'scrollY',  default: 0.5,  }
    , {  type: 'float',  name: 'speed',  default: 0,  }   ],
    `_st.y += _c0.r*scrollY + time*speed;
     return fract(_st);`)

, Fn('add', 'combine',
    [ {  type: 'float',  name: 'amount',  default: 1,  }   ],
    `return (_c0+_c1)*amount + _c0*(1.0-amount);`)
	
, Fn('sub', 'combine',
    [ { type: 'float',  name: 'amount',  default: 1,  }   ],
    `return (_c0-_c1)*amount + _c0*(1.0-amount);`)
	
, Fn('layer', 'combine',
    [],
    `return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), _c0.a+_c1.a);`)
	
, Fn('blend', 'combine',
    [ {  type: 'float',  name: 'amount',  default: 0.5,  }   ],
    `return _c0*(1.0-amount)+_c1*amount;`)
	
, Fn('mult', 'combine',
    [ {  type: 'float',  name: 'amount',  default: 1,  }   ],
    `return _c0*(1.0-amount)+(_c0*_c1)*amount;`)
	
, Fn('diff', 'combine',
    [],
    `return vec4(abs(_c0.rgb-_c1.rgb), max(_c0.a, _c1.a));`)
	
, Fn('modulate', 'combineCoord',
    [ {  type: 'float',  name: 'amount',  default: 0.1,  }   ],
    `//  return fract(st+(_c0.xy-0.5)*amount);
     return _st + _c0.xy*amount;`)

, Fn('modulateScale', 'combineCoord',
    [ {  type: 'float',  name: 'multiple',  default: 1,  }
    , {  type: 'float',  name: 'offset',  default: 1,  } ],
    `vec2 xy = _st - vec2(0.5);
     xy*=(1.0/vec2(offset + multiple*_c0.r, offset + multiple*_c0.g));
     xy+=vec2(0.5);
     return xy;`)
	
, Fn('modulatePixelate', 'combineCoord',
    [ {  type: 'float',  name: 'multiple',  default: 10,  }
    , { type: 'float',  name: 'offset',  default: 3,  }   ],
    `vec2 xy = vec2(offset + _c0.x*multiple, offset + _c0.y*multiple);
     return (floor(_st * xy) + 0.5)/xy;`)
	
, Fn('modulateRotate', 'combineCoord',
    [ {  type: 'float',  name: 'multiple',  default: 1,  }
    , {  type: 'float',  name: 'offset',  default: 0,  }   ],
    `vec2 xy = _st - vec2(0.5);
     float angle = offset + _c0.x * multiple;
     xy = mat2(cos(angle),-sin(angle), sin(angle),cos(angle))*xy;
     xy += 0.5;
     return xy;`)
	
, Fn('modulateHue', 'combineCoord',
    [ { type: 'float',  name: 'amount',  default: 1,  }   ],
    `return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0/resolution);`)
	
, Fn('invert', 'color',
    [ {  type: 'float',  name: 'amount',  default: 1,  }   ],
    `return vec4((1.0-_c0.rgb)*amount + _c0.rgb*(1.0-amount), _c0.a);`)
	
, Fn('contrast', 'color',
    [ {  type: 'float',  name: 'amount',  default: 1.6,  }   ],
    `vec4 c = (_c0-vec4(0.5))*vec4(amount) + vec4(0.5);
     return vec4(c.rgb, _c0.a);`)
	
, Fn('brightness', 'color',
    [ {  type: 'float',  name: 'amount',  default: 0.4,  }   ],    
    `return vec4(_c0.rgb + vec3(amount), _c0.a);`)
	
, Fn('mask', 'combine',
    [], 
    `float a = _luminance(_c1.rgb);
     return vec4(_c0.rgb*a, a);`)
	
, Fn('luma', 'color',
    [ { type: 'float', name: 'threshold', default: 0.5, }
    , { type: 'float', name: 'tolerance', default: 0.1, } ],
    `float a = smoothstep(threshold-tolerance, threshold+tolerance, _luminance(_c0.rgb));
     return vec4(_c0.rgb*a, a);`)

, Fn('thresh', 'color',
    [ { type: 'float', name: 'threshold', default: 0.5,  }
    , { type: 'float', name: 'tolerance', default: 0.04, } ],
    `return vec4(vec3(smoothstep(threshold-tolerance, threshold+tolerance, _luminance(_c0.rgb))), _c0.a);`)
	
, Fn('color', 'color',
    [ { type: 'float', name: 'r', default: 1, }
    , { type: 'float', name: 'g', default: 1, }
    , { type: 'float', name: 'b', default: 1, }
    , { type: 'float', name: 'a', default: 1, } ],
    `vec4 c = vec4(r, g, b, a);
     vec4 pos = step(0.0, c); // detect whether negative
     // if > 0, return r * _c0
     // if < 0 return (1.0-r) * _c0
     return vec4(mix((1.0-_c0)*abs(c), c*_c0, pos));`)
	
, Fn('saturate', 'color',
    [ {  type: 'float',  name: 'amount',  default: 2,  }   ],
    `const vec3 W = vec3(0.2125, 0.7154, 0.0721);
     vec3 intensity = vec3(dot(_c0.rgb, W));
     return vec4(mix(intensity, _c0.rgb, amount), _c0.a);`)
	
, Fn('hue', 'color',
    [ { type: 'float', name: 'hue', default: 0.4 } ],
    `vec3 c = _rgbToHsv(_c0.rgb);
     c.r += hue;
     //  c.r = fract(c.r);
     return vec4(_hsvToRgb(c), _c0.a);`)

, Fn('colorama', 'color',
    [ { type: 'float', name: 'amount', default: 0.005, } ],
    `vec3 c = _rgbToHsv(_c0.rgb);
     c += vec3(amount);
     c = _hsvToRgb(c);
     c = fract(c);
     return vec4(c, _c0.a);`)

, Fn('prev', 'src',
    [],
    `   return texture2D(prevBuffer, fract(_st));`)

, Fn('sum', 'color',
    [ { type: 'vec4', name: 'scale', default: 1 } ],
    `  vec4 v = _c0 * s;
       return v.r + v.g + v.b + v.a;
     }
     float sum(vec2 _st, vec4 s) { // vec4 is not a typo, because argument type is not overloaded
     vec2 v = _st.xy * s.xy;
     return v.x + v.y;`)

, Fn('r', 'color',
    [ { type: 'float', name: 'scale',  default: 1, }
    , { type: 'float', name: 'offset', default: 0, } ],
    `return vec4(_c0.r * scale + offset);`)

, Fn('g', 'color',
    [ { type: 'float', name: 'scale',  default: 1, }
    , { type: 'float', name: 'offset', default: 0, } ],
    `return vec4(_c0.g * scale + offset);`)

, Fn('b', 'color',
    [ { type: 'float', name: 'scale',  default: 1 },
      { type: 'float', name: 'offset', default: 0 } ],
    `return vec4(_c0.b * scale + offset);`)

, Fn('a', 'color',
    [ { type: 'float', name: 'scale',  default: 1 }
    , { type: 'float', name: 'offset', default: 0 } ],
    `return vec4(_c0.a * scale + offset);` )

]

function Fn (name, type, inputs, glsl) {
  return { name, type, inputs, glsl }
}
