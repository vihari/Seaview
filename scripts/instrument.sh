#!/usr/bin/bash

set -e
export UNIFI=$HOME/repos/unifi
export CLASSPATH="$UNIFI/classes/unifi.jar:$UNIFI/lib/bcel-5.2.jar:$UNIFI/lib/log4j-1.2.15.jar:$UNIFI/lib/commons-logging-1.1.1.jar:$UNIFI/lib/gson-1.5.jar"

if [ -z $1 ];
then 
    printf "Usage is:\n"
    printf "bash instrument.sh <path to muse-standalone.jar/muse-standalone.jar>\n"
    exit 0
fi

# extract muse.war, muse.jar
rm -R -f tmpmuse
mkdir tmpmuse
cd tmpmuse
jar -xvf $1 muse.war
jar -xvf muse.war WEB-INF/lib/muse.jar
echo $CLASSPATH

export TARGET=WEB-INF/lib/muse.jar
export CLASSPATH="$TARGET\:$CLASSPATH"
echo $CLASSPATH
java -Xmx1g -classpath $CLASSPATH unifi.drivers.Instrumenter $TARGET

# instrumented files under seaview, jar up and copy to target
cd SEAVIEW
jar cvf ../muse.jar .
cd ..
/bin/rm -f $TARGET
mv muse.jar $TARGET

# update muse.jar in muse.war and also insert unifi.jar for the seaview runtime
cp -p $UNIFI/classes/unifi.jar WEB-INF/lib/
jar uvf muse.war WEB-INF/lib

# update muse.war in muse-standalone
jar uvf $1 muse.war
cd ..
#rm -rf tmpmuse