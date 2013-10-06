#####################################
# This script parses the log file and 
# tries to extract some fields off it 
# and writes it in to a json/js format. 
#####################################

#!/usr/bin/perl
use strict;
use warnings;

sub is_num{
    my ($string) = @_;
    if($string =~ /^\s*?[-+]?[0-9]*\.?[0-9]+$/){
	return 1; 
    }
    else{
	return 0;
    }
}

my $num_args = $#ARGV+1;
if($num_args<1){
    print "Usage: args: full path of the log file from which\n fields extraction is desired\n";
    exit;
}

my $json = 'var run_logs = [';
open(LOG_FILE,$ARGV[0]);
my $line_num = 0;
my $first = 1;
while(<LOG_FILE>){
    $line_num = $line_num+1;
    chomp;
    my $log = $_;
    
    if($log=~/SV/){
	while($log =~ m/.*?:::SV([0-9]*):::(.*?):::/g){
	    if($first){
		$json = $json."{";
	    }
	    else{
		$json = $json.",{";
	    }
	    $json=$json."\"lineNum\": ".($line_num+0).",";
	    $json=$json."\"ip_num\": ".($1+0).",";
	    	    
	    if(is_num($2)){
		$json=$json."\"value\": ".($2+0).",";
	    }
	    else{
		#value string may contain quotations which need to be scaped
		my $test = $2;
		$test =~ s/\"/\\\"/g;
		$json=$json."\"value\": \"".$test."\" ,";
	    }
	    #generally the info padding of the log routine ends with -
	    #and the first 3 fields being the date, time and month.
	    
	    #less greedy match   
	    if($_ =~ m/^(.*?)\s\-\s/g){
		if($1 eq ""){
		    next;
		}
		my @f=split(/\s+/,$1);
		$json=$json."\"time\": {\"date\":".($f[0]+0).",";
		if(is_num($f[1])){
		    $json=$json."\"month\":".($f[1]+0).",";
		}
		else{
		    $json = $json."\"month\": \"".$f[1]."\" ,";
		}
		my @cl_time = split(':',$f[2]);
                #convert to ints before writing to remove any leading 0's
		$json=$json."\"hr\":".($cl_time[0]+0).',';
		$json=$json."\"min\":".($cl_time[1]+0).',';
		$json=$json."\"sec\":".($cl_time[2]+0).'},';
	    }
	    else{
		$json=$json."\"time\": {\"date\":"."\"nill\"".",";
		$json=$json."\"month\":"."\"nill\"".",";
		$json=$json."\"hr\":"."\"nill\"".',';
		$json=$json."\"min\":"."\"nill\"".',';
		$json=$json."\"sec\":"."\"nill\"".'},';
	    }
	    
	    $log =~ s/:::SV([0-9]*):::(.*?):::/\*/g;
	    $json = $json."\"log\": \"".$log."\"";
	    $json = $json."}";
	    
	    if($first){
		$first = 0;
	    }
	}
    }
}
$json=$json."]";
print $json;
