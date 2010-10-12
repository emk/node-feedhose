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
* `feednozzle`: A [Socket.io][sio]-based server.
* `public/index.html`: A Socket.io-based web client.

Why do I use Socket.io to talk to the browser, and not the regular feedhose
protocol?  Basically, long-polling has some issues with certain browsers
and firewalls, and Socket.io offers a dead-simple API that deals with all
those headaches.  It also works with mobile phones, or so I hear.

[sio]: http://socket.io/

## Installing on an Ubuntu

First, you'll need an Ubuntu 10.10 box, or something reasonably similar.
I'm using an EC2 t1.micro image running Ubuntu 10.10 ami-508c7839.  This
costs me about 2 cents/hour.  Feel free to run a bigger instance--it will
definitely take less time to install Node.js.

First, open up ports `8000` and `843` on your EC2 security group.  The
latter is needed to serve up some Flash policy files used as a fallback by
`Socket.io`.

Next, install `git`, clone this repository, and run the install script:

    sudo apt-get update && sudo apt-get upgrade
    sudo apt-get install git
    git clone git://github.com/emk/node-feedhose.git
    cd node-feedhose
    ./ubuntu-install

This will instruct you on how to proceed.

## Making it robust (optional!)

Set up `upstart` and `monit`.  This is very Ubuntu-specific.

    sudo apt-get install monit
    sudo cp extras/feednozzle.conf.upstart /etc/init/feednozzle.conf
    sudo cp extras/feednozzle.monit /etc/monit/conf.d/feednozzle

Next, edit `/etc/monit/monitrc` to taste.  10 second checks are fine.  You
may now start your server and your monitor process.

    sudo start feednozzle
    sudo /etc/init.d/monit start

Note that I haven't made any attempt to rotate logs or otherwise act as a
well-behaved daemon yet.  This is an exercise for another day.

## What's this "coffee" stuff, anyways?

[CoffeeScript][cs] is a preprocessor for JavaScript.  I use it for several
files in `node-feedhose`.  Thanks to CoffeeScript, I don't need spend quite
so much time writing ugly `function () {` prefixes, and I can declare
classes without nearly so much boilerplate code.  Go look at the [pretty
examples][cs].

I haven't decided whether to translate `node-feedhose` to regular
JavaScript.

[cs]: http://jashkenas.github.com/coffee-script/
