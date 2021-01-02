let pkgs = import <nixpkgs> {}; in pkgs.stdenv.mkDerivation rec {
  name = "hydralisque";
  propagatedBuildInputs = with pkgs; [
    nodejs-14_x
    nodePackages.npm
    electron_11
  ];
  shellHook = ''
    export PATH=`pwd`/node_modules/.bin:$PATH
  '';
}
