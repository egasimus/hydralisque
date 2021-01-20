let
  pkgs = import <nixpkgs> {};
  nodeDependencies = (pkgs.callPackage ./node-to.nix {}).shell.nodeDependencies;
in pkgs.stdenv.mkDerivation rec {
  name = "hydralisque";
  propagatedBuildInputs = with pkgs; [
    nodejs-14_x
    nodePackages.npm
    electron_11
  ];
  buildPhase = ''
    ln -s ${nodeDependencies}/lib/node_modules ./node_modules
    export PATH
  '';
  shellHook = ''
    export PATH=`pwd`/node_modules/.bin:$PATH
  '';
}
