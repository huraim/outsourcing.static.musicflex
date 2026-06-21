#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(cd "$ROOT_DIR/../2_NextJS/frontend" && pwd)"
SCSS_SRC="$ROOT_DIR/scss/source"
SCSS_TMP="$ROOT_DIR/scss/tmp"

mkdir -p \
  "$ROOT_DIR/assets/images/pages/musicflex/intro/customer" \
  "$ROOT_DIR/assets/images/layouts/gnb" \
  "$ROOT_DIR/assets/images/layouts/footer" \
  "$ROOT_DIR/assets/images/components" \
  "$ROOT_DIR/assets/icons/musicflex" \
  "$ROOT_DIR/assets/fonts" \
  "$ROOT_DIR/css" \
  "$SCSS_SRC" \
  "$SCSS_TMP"

copy_assets() {
  cp -r "$FRONTEND_DIR/public/images/pages/musicflex/intro/." "$ROOT_DIR/assets/images/pages/musicflex/intro/"
  cp -r "$FRONTEND_DIR/public/images/layouts/gnb/." "$ROOT_DIR/assets/images/layouts/gnb/"
  cp "$FRONTEND_DIR/public/images/layouts/footer/"* "$ROOT_DIR/assets/images/layouts/footer/"
  cp "$FRONTEND_DIR/public/images/components/audio/shortcut_key_close_btn.svg" "$ROOT_DIR/assets/images/components/"
  cp "$FRONTEND_DIR/public/icons/musicflex/favicon_256.png" "$ROOT_DIR/assets/icons/musicflex/"
  cp "$FRONTEND_DIR/public/fonts/NanumSquare"*.woff "$ROOT_DIR/assets/fonts/"
}

fix_asset_paths() {
  local input_file="$1"
  local output_file="$2"
  sed \
    -e "s|/_next_public/|../assets/|g" \
    -e "s|url('/images/|url('../assets/images/|g" \
    -e "s|url(\"/images/|url(\"../assets/images/|g" \
    -e 's/:global(\([^)]*\))/\1/g' \
    "$input_file" > "$output_file"
}

prepare_scss_sources() {
  fix_asset_paths "$FRONTEND_DIR/public/styles/global/partial/variable.scss" "$SCSS_SRC/_variable.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/global/partial/reset.scss" "$SCSS_SRC/_reset.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/global/partial/text_responsive.scss" "$SCSS_SRC/_text_responsive.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/global/partial/gnb.scss" "$SCSS_SRC/_gnb.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/global/partial/footer.scss" "$SCSS_SRC/_footer.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/global/partial/musicflex/gnb.scss" "$SCSS_SRC/_musicflex_gnb.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/global/partial/shine_hover.scss" "$SCSS_SRC/_shine_hover.scss"

  fix_asset_paths "$FRONTEND_DIR/public/styles/pages/musicflex/intro.module.scss" "$SCSS_TMP/_intro.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/elements/grid/grid_page.module.scss" "$SCSS_TMP/_grid_page.scss"
  sed 's/\.wrapper/.grid-wrapper/g; s/\.inner/.grid-inner/g' "$SCSS_TMP/_grid_page.scss" > "$SCSS_SRC/_grid_page.scss"

  fix_asset_paths "$FRONTEND_DIR/public/styles/components/iphone/iphone.module.scss" "$SCSS_TMP/_iphone.scss"
  sed 's/\.phone_wrapper/.iphone-phone-wrapper/g; s/\.phone/.iphone-phone/g; s/\.buttons/.iphone-buttons/g; s/\.button/.iphone-button/g; s/\.left/.iphone-left/g; s/\.right/.iphone-right/g; s/\.screen_container/.iphone-screen-container/g; s/\.bg/.iphone-bg/g; s/\.notch_blur/.iphone-notch-blur/g' "$SCSS_TMP/_iphone.scss" > "$SCSS_SRC/_iphone.scss"

  fix_asset_paths "$FRONTEND_DIR/public/styles/components/scroll_info/scroll_down.module.scss" "$SCSS_SRC/_scroll_down.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/components/modal/modal_mini.module.scss" "$SCSS_SRC/_modal_mini.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/layouts/musicflex/footer/footer.module.scss" "$SCSS_SRC/_footer_module.scss"
  fix_asset_paths "$FRONTEND_DIR/public/styles/layouts/musicflex/gnb/gnb_bottom.module.scss" "$SCSS_TMP/_gnb_bottom.scss"
  sed 's/\.wrapper/.gnb-bottom-wrapper/g; s/\.menu_ul/.gnb-bottom-menu-ul/g; s/\.menu_li/.gnb-bottom-menu-li/g; s/\.menu_btn/.gnb-bottom-menu-btn/g; s/\.menu_image/.gnb-bottom-menu-image/g; s/\.menu_text/.gnb-bottom-menu-text/g; s/\.animation/.gnb-bottom-animation/g; s/\.active/.gnb-bottom-active/g' "$SCSS_TMP/_gnb_bottom.scss" > "$SCSS_SRC/_gnb_bottom.scss"

  cat > "$SCSS_SRC/_fonts.scss" <<'EOF'
@font-face {
  font-family: 'nanum-square';
  font-display: swap;
  font-weight: 300;
  src: url('../assets/fonts/NanumSquareL.woff') format('woff');
}
@font-face {
  font-family: 'nanum-square';
  font-display: swap;
  font-weight: 400;
  src: url('../assets/fonts/NanumSquareR.woff') format('woff');
}
@font-face {
  font-family: 'nanum-square';
  font-display: swap;
  font-weight: 700;
  src: url('../assets/fonts/NanumSquareB.woff') format('woff');
}
@font-face {
  font-family: 'nanum-square';
  font-display: swap;
  font-weight: 900;
  src: url('../assets/fonts/NanumSquareEB.woff') format('woff');
}

*,
html,
body {
  font-family: 'nanum-square', sans-serif;
}
EOF
}

compile_css() {
  if [ ! -x "$ROOT_DIR/dart-sass/sass" ]; then
    curl -sL https://github.com/sass/dart-sass/releases/download/1.86.3/dart-sass-1.86.3-linux-x64.tar.gz \
      | tar xz -C "$ROOT_DIR"
  fi
  "$ROOT_DIR/dart-sass/sass" "$ROOT_DIR/scss/main.scss" "$ROOT_DIR/css/main.css" --style=compressed
}

copy_assets
prepare_scss_sources
compile_css

echo "Build complete: $ROOT_DIR"
