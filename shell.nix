let pkgs = import <nixpkgs> {}; in pkgs.stdenv.mkDerivation rec {
  name = "hydralisque";
  propagatedBuildInputs = with pkgs; [
    nodejs-14_x
    nodePackages.npm
    electron_11
    nodePackages.node2nix
  ];
  buildInputs = pkgs.electron_11.buildInputs;
  shellHook = ''
    export PATH=`pwd`/node_modules/.bin:$PATH
  '';
}
