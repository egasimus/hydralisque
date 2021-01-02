let pkgs = import <nixpkgs> {}; in pkgs.stdenv.mkDerivation rec {
  name = "hydralisque";
  nativeBuildInputs = with pkgs; [
    python2
    pkg-config
    nodePackages.npm
    nodejs
    electron_11
  ];
  buildInputs = with pkgs; [
    alsaLib
    at_spi2_atk
    at_spi2_core
    atk
    cairo
    cups
    dbus
    dbus_glib
    expat
    fontconfig
    freetype
    gdk-pixbuf
    glib
    glibc
    gnome2.pango
    gnome3.libsecret
    gobject-introspection
    gtk3
    libdrm
    libuuid
    libxkbcommon
    mesa_noglu
    nspr
    nss
    xlibs.libX11
    xlibs.libXScrnSaver
    xlibs.libXcomposite
    xlibs.libXcursor
    xlibs.libXdamage
    xlibs.libXext
    xlibs.libXfixes
    xlibs.libXi
    xlibs.libXrandr
    xlibs.libXrender
    xlibs.libXt
    xlibs.libXtst
    xlibs.libxcb
  ];
  propagatedBuildInputs = with pkgs; [nodejs-14_x];
  LD_LIBRARY_PATH = pkgs.stdenv.lib.strings.makeLibraryPath (buildInputs ++ nativeBuildInputs);
	shellHook = ''
		patchelf --set-interpreter ${pkgs.glibc}/lib/ld-linux-x86-64.so.2 node_modules/electron/dist/electron
  '';
}
