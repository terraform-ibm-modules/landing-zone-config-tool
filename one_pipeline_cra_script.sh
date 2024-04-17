#!/usr/bin/env bash

# This file needs to be referenced with the cra-custom-script-path
# environment variable in the one pipeline

if [[ "${PIPELINE_DEBUG:-0}" == 1 ]]; then
    trap env EXIT
    env | sort
    set -x
fi

# Any docker build-arg needs to be exported here
# per: https://cloud.ibm.com/docs/code-risk-analyzer-cli-plugin#devsecops-custom-script-examples


REDHAT_USERNAME=$(get_env redhat-username)
export REDHAT_USERNAME
REDHAT_PASSWORD=$(get_env redhat-password)
export REDHAT_PASSWORD
ARTIFACTORY_USERNAME=$(get_env artifactory-user)
export ARTIFACTORY_USERNAME
ARTIFACTORY_PASSWORD=$(get_env artifactory-password)
export ARTIFACTORY_PASSWORD
DOCKER_BUILDKIT=1
export DOCKER_BUILDKIT
