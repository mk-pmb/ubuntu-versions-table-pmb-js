#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function update_releases () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly

  local SELFFILE="$(readlink -m -- "$BASH_SOURCE")"
  local SELFPATH="$(dirname -- "$SELFFILE")"
  local SELFNAME="$(basename -- "$SELFFILE" .sh)"
  local INVOKED_AS="$(basename -- "$0" .sh)"

  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local URL='https://wiki.ubuntu.com/Releases?action=raw'
  local CHC='releases.txt'
  local MSG=
  if [ ! -s "$CHC" ]; then
    MSG="save the text from $URL as '$CHC'"
    echo "D: Trying to $MSG:"
    URL="http://web.archive.org/save/$URL"
    wget --tries=1 --timeout=60 --output-document="tmp.$$.$CHC" \
      -- "$URL" || return $?$(echo "E: Failed to $MSG" >&2)
    mv --verbose --no-target-directory -- {tmp.$$.,}"$CHC" || return $?
  fi

  echo "D: Gonna parse releases page:"
  nodemjs parseReleases.mjs || return $?
}










update_releases "$@"; exit $?
