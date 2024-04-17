# -*- mode:makefile; coding:utf-8 -*-
# include common-dev-assets/module-assets/config.env
# export

ifndef BUILD_DATE
  override BUILD_DATE:=$(shell /bin/date "+%Y%m%d-%H%M%S")
endif

.DEFAULT_GOAL = dependency-pre-commit
ifneq (,$(filter $(detected_OS), Darwin Linux))
	.DEFAULT_GOAL = all
endif

#
# pre-commit
#

all: dependency-install-darwin-linux dependency-pre-commit

dependency-install-darwin-linux:
	./ci/install-deps.sh

dependency-pre-commit:
	pre-commit install

pre-commit: dependency-pre-commit
	pre-commit run --all-files

clean-npmrc:
	@rm -f .npmrc

create-npmrc:  clean-npmrc
	@echo 'Creating .npmrc file'
	curl -u ${ARTIFACTORY_USERNAME}:${ARTIFACTORY_PASSWORD} "https://na-private.artifactory.swg-devops.com/artifactory/api/npm/auth/" > .npmrc
	echo "registry=https://na-private.artifactory.swg-devops.com/artifactory/api/npm/wcp-goldeneye-team-npm-virtual" >> .npmrc
	sed -i.bak 's/_auth/\/\/na-private.artifactory.swg-devops.com\/artifactory\/api\/npm\/:_auth/' .npmrc
	rm -f .npmrc.bak

clean-npm:
	rm -rf node_modules/ client/node_modules/
	rm -f package-lock.json client/package-lock.json
	npm install --save-dev
	cd client; npm install --save-dev
