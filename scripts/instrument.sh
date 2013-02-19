#!/usr/bin/bash
set -e

if [ -z $1 ];
then 
    printf "Usage is:\n"
    printf "bash instrument.sh <path to muse-standlaone.jar/muse-standlaone.jar>\n"
    exit 0
fi

#making of muse_war
rm -R -f tmpmuse
mkdir tmpmuse
cd tmpmuse
jar -xvf $1
mkdir muse_war
cd muse_war
jar -xvf ../muse.war 
cd ../

cp -R ../hangal .
#copy=${1%/}
#copy=$(echo $copy|awk -F "/" '{print $NF}')
cd hangal
rm -R -f edu
rm -f muse.jar
cp ../muse_war/WEB-INF/lib/muse.jar .
jar -xvf muse.jar
./do
cd SEAVIEW
jar -cvf ../muse.jar edu
cd ..
cp -R SEAVIEW ../../
rm ../muse_war/WEB-INF/lib/muse.jar
cp muse.jar ../muse_war/WEB-INF/lib/
cp unifi.jar ../muse_war/WEB-INF/lib/
cd ../muse_war
jar -cvf ../muse.war .
cd ..
rm -R muse_war
rm -R hangal
jar -cvf ../muse-standalone-instrumeneted.jar .
cd ..
rm -R tmpmuse
