#! /usr/bin/sh -v
set -e

if [ -z $1 ];
then
    printf "Usage is \n";
    printf "bash startup.sh <PortNumber>\n"
    printf "Also make sure you are in the base directory\n";
    exit 0;
fi
python -m SimpleHTTPServer $1