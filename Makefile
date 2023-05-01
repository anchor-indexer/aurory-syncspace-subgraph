deploy:
	@anchor-indexer deploy aurory-ocil

create:
	@anchor-indexer create aurory-ocil mainnet

remove:
	@anchor-indexer remove aurory-ocil

codegen:
	@anchor-indexer codegen

build:
	@$(MAKE) codegen
	@anchor-indexer build

.PHONY: deploy create remove codegen build