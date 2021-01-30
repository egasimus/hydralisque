let pkgs = import <nixpkgs> {}; in pkgs.stdenv.mkDerivation rec {
  name = "hydralisque";
  propagatedBuildInputs = with pkgs; [
    nodejs-14_x
    electron_11
    yarn
    pkg-config
    xlibs.libX11
    xlibs.libXi
    xlibs.libXext
  ];
  buildInputs = [ pkgs.electron_11.buildInputs ];
  shellHook = ''
    export PATH=`pwd`/node_modules/.bin:$PATH
  '';
}
