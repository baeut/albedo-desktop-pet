# Albedo Desktop Pet — Makefile
.PHONY: dev start build build-win build-mac build-linux clean install

install:
	npm install

dev:
	npm run dev

start:
	npm start

build-win:
	npm run build:win

build-mac:
	npm run build:mac

build-linux:
	npm run build:linux

clean:
	rm -rf node_modules dist

# Open 3-view reference sheet in browser
view-ref:
	@echo "Opening three-view reference sheet..."
	@xdg-open assets/reference/three-view.html 2>/dev/null || open assets/reference/three-view.html 2>/dev/null || echo "Open assets/reference/three-view.html manually"

# Generate a placeholder icon (requires ImageMagick)
icon:
	@which convert >/dev/null && convert -size 256x256 xc:transparent \
		-fill '#1a0a2e' -draw 'circle 128,128 128,60' \
		-fill '#ffd700' -draw 'circle 128,128 128,100' \
		assets/icon.png || echo "ImageMagick not found, skipping icon generation"
