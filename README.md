WARNING: This is a hack in progress.  You'd have to be pretty brave to want
to run it.

`node-feedhose` is an experimental client for Dave Winer's feedhose
protocol.  See [Feedhose -- a firehose for feeds][fh1] and [RSS data in
JSON format][fh2] for details.  Why feedhose?  It's roughly the same idea
as PubSubHubBub, but instead of notifying you when an RSS feed changes (so
you can download and reparse the entire thing), it just sends you the
changed items as JSON.

[fh1]: http://scripting.com/stories/2010/09/30/feedhoseAFirehoseForFeeds.html
[fh2]: http://scripting.com/stories/2010/10/09/nextStepsInTheFeedhoseProj.html

What's here:

* `feedhose.js`: An experimental protocol library.
* `feednozzle`: A Socket.io-based server.
* `public`: A Socket.io-based web client.

Why do I use Socket.io to talk to the browser, and not the regular feedhose
protocol?  Basically, long-polling has some issues with certain browsers
and firewalls, and Socket.io offers a dead-simple API that deals with all
those headaches.

## Installing on an Ubuntu

First, you'll need an Ubuntu 10.10 box, or something reasonably similar.
I'm using an EC2 t1.micro image running Ubuntu 10.10 ami-508c7839.  This
costs me about 2 cents/hour.

First, open up port 8000 on your EC2 security group.

Next, install `git`, clone this repository, and run the install script:

    sudo apt-get update && sudo apt-get upgrade
    sudo apt-get install git
    git clone git://github.com/emk/node-feedhose.git
    cd node-feedhose
    ./ubuntu-install

This will instruct you on how to proceed.

    
