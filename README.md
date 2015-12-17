Seaview
=======

Seaview eases the analysis of log with program analysis techniques and handy data-visualisations. This is a sister project of unifi (https://github.com/hangal/unifi).<br>

##Usage
1. Unifi analyses and instruments the classes.
2. The log of the instrumented software will now have the extra information about the variables involved in logging such as the unifi-related markers like its units and dimensions.
3. Seaview can now help you analyse the log file. Host the war in a webserver and open it in a browser (preferably firefox or chrome).
4. Point it to the log file that was produced by the instrumented software, from the browser.
5. The page should then navigate you to all the analysis/visualisations you can make. (Well the documentation is yet to be compiled.)

To understand how an instrumented log file looks like see this [file](https://github.com/vihari/Seaview/blob/master/test/muse.log)<br>
Try the demo [here](http://vihari.github.io/Seaview/) with the log file above
