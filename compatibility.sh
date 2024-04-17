#!/bin/bash

usage() {
  # Display Help
  echo
  echo "Syntax: $ compatibility.sh [-h]"
  echo "Options:"
  echo "  q     Quiet mode for tfxjs (defaults to false)."
  echo "  h     Print help."
  echo
}

# define arguments for getopts to look for (h, a, s)
while getopts ":ahsq:" opt; do
  # for each argument present assign the correct value to override the default value
  # values defined after the flag are stored in $OPTARG
  case $opt in
  h) # if -h print usage
    usage
    exit 0
    ;;
  q) ;;
  a) ;;
  s) ;;
  \?) # this case is for when an unknown argument is passed (e.g. -c)
    echo "Invalid option: -$OPTARG"
    exit 1
    ;;
  esac
done

cd compatibility-tests || exit
# generate the override.json files and run tests
patterns=("roks" "vsi" "vpc")
for pattern in "${patterns[@]}"; do
  # shellcheck disable=SC2140
  printf "\033[3;95mGenerating override.json for "%s" pattern.\033[0m" "${pattern}" # print italics magenta (3;95m)
  node generate-overrides.js "${pattern}" # generate override for pattern
done
