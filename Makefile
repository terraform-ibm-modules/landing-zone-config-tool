# -*- mode:makefile; coding:utf-8 -*-

#
# npm
#

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
