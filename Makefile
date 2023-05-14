deploy:
	@anchor-indexer deploy aurory-syncspace

create:
	@anchor-indexer create aurory-syncspace mainnet

remove:
	@anchor-indexer remove aurory-syncspace

codegen:
	@anchor-indexer codegen

build:
	@$(MAKE) codegen
	@anchor-indexer build

.PHONY: deploy create remove codegen build