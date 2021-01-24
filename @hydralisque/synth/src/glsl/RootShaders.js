const RootShaders = module.exports = {

  ALL_FRAG: precision => `
    precision ${precision} float;
    varying vec2 uv;
    uniform sampler2D tex0;
    uniform sampler2D tex1;
    uniform sampler2D tex2;
    uniform sampler2D tex3;
    void main () {
      vec2 st = vec2(1.0 - uv.x, uv.y);
      st*= vec2(2);
      vec2 q = floor(st).xy*(vec2(2.0, 1.0));
      int quad = int(q.x) + int(q.y);
      st.x += step(1., mod(st.y,2.0));
      st.y += step(1., mod(st.x,2.0));
      st = fract(st);
      if(quad==0){
        gl_FragColor = texture2D(tex0, st);
      } else if(quad==1){
        gl_FragColor = texture2D(tex1, st);
      } else if (quad==2){
        gl_FragColor = texture2D(tex2, st);
      } else {
        gl_FragColor = texture2D(tex3, st);
      }
    }`,

  ALL_VERT: precision => `
    precision ${precision} float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = position;
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

  FBO_FRAG: precision => `
    precision ${precision} float;
    varying vec2 uv;
    uniform vec2 resolution;
    uniform sampler2D tex0;
    void main () {
      gl_FragColor = texture2D(tex0, vec2(1.0 - uv.x, uv.y));
    }`,

  FBO_VERT: precision => `
    precision ${precision} float;
    attribute vec2 position;
    varying vec2 uv;
    void main () {
      uv = position;
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

}
