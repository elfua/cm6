.PHONY: install clean build dev start test lint lint-fix

NPM := $(shell command -v pnpm 2>/dev/null || echo npm)

install:
	$(NPM) install

clean:
	$(NPM) run clean

build:
	$(NPM) run build

dev:
	$(NPM) run build:dev

start:
	$(NPM) start

test:
	$(NPM) test

lint:
	$(NPM) run lint

lint-fix:
	$(NPM) run lint:fix