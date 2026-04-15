#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function update_releases () {
  export LANG{,UAGE}=en_US.UTF-8  # make error messages search engine-friendly
  local SELFPATH="$(readlink -m -- "$BASH_SOURCE"/..)"
  cd -- "$SELFPATH" || return $?

  local DOCS_REPO='https://github.com/ubuntu/ubuntu-project-docs/'
  local DOCS_RAW="${DOCS_REPO}raw/refs/heads/main/"
  local URL="${DOCS_RAW}docs/release-team/list-of-releases.md"

  # To find an old version for a specific date, we could query
  # https://api.github.com/repos/ubuntu/ubuntu-project-docs/commits
  # ?path=docs/release-team/list-of-releases.md
  # &until=2026-08-02T23:59:59&per_page=1
  # /!\ NB: That only goes back to 2025-09-10T16:53:18Z.

  local CHC="tmp.cache.$(printf '%(%y%m%d)T' -1).releases.txt"
  local MSG=
  if [ ! -s "$CHC" ]; then
    MSG="save the text from $URL as '$CHC'"
    echo "D: Trying to $MSG:"
    # URL="http://web.archive.org/save/$URL"
    wget --tries=1 --timeout=60 --output-document="tmp.$$.$CHC" \
      -- "$URL" || return $?$(echo "E: Failed to $MSG" >&2)
    mv --verbose --no-target-directory -- {tmp.$$.,}"$CHC" || return $?
  fi

  echo D: 'Gonna parse releases page:'
  <"$CHC" sed -nrf <(
    echo '
      s~\(https?://[A-Za-z0-9_./-]+\)?~~g
      s~\*~~g
      s~\\~~g
      '
    TZ=UTC LC_TIME='en_US.UTF-8' printf -- \
      '%(s~\b(%B)\b~<month>%m~ig)T\n' {1..300..27}00000
    echo '
      s~\[|\]~~g
      s~\| <month>([0-9]{2}) ([0-9]), ([0-9]{4}) ~| \3-0\2-\1 ~g
      s~\| <month>([0-9]{2}) ([0-9]{2}), ([0-9]{4}) ~| \3-\2-\1 ~g
      s~\| <month>([0-9]{2}) ([0-9]{4}) ~| \2-\1 ~g

      s~^## +~sect "~p
      s~^\| Ubuntu ~vers "~p
      s~^\| ([A-Z])~head "\1~p
    ') | sed -rf <(echo '
      s~[ |]*$~"]~
      s~ \| ~", "~g
      s~\s+~ ~g
      s~" ~"~g
      s~ {2,}"~ "~g
      s~^(\S+) ~\["\1", ~
    ') >tmp.releases.jsonl
  node parseReleases.mjs || return $?
}










update_releases "$@"; exit $?
