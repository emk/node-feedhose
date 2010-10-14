(function () {
  // Convert an iso8601 date to one in the current time zone.
  function prettyDate(date) {
    var m = date.match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):/);
    if (!m)
      return to_html(date);
    var d = new Date();
    var utc = new Date(Date.UTC(parseInt(m[1]), parseInt(m[2])-1,
                                parseInt(m[3]), parseInt(m[4]),
                                parseInt(m[5])));
    var hour = utc.getHours(), am_pm;
    if (hour == 0) {
      hour = 12;
      am_pm = 'am';
    } else if (hour < 12) {
      am_pm = 'am';
    } else {
      am_pm = 'pm';
      if (hour > 12)
        hour -= 12;
    }
    var minute = utc.getMinutes() + '';
    if (minute.length == 1)
      minute = '0' + minute;
    return hour + ":" + minute + am_pm;
  };

  // A cache of template HTML.
  var templates = {};

  // Render an HTML template.  This interface is inspired by John Resig's
  // microtemplating.
  function tmpl(templateId, view) {
    if (!templates.hasOwnProperty(templateId))
      templates[templateId] = document.getElementById(templateId).innerHTML;
    return Mustache.to_html(templates[templateId], view);
  }

  // Get the current time, in milliseconds.
  function getTime() {
    return new Date().getTime();
  }

  // The GUIDs for all the items we've seen so far.  This allows us to
  // suppress duplicates.
  var guids = {};

  // Get the GUID of an RSS item.  If we want to handle feeds without
  // GUIDs, then we could fall back to links and titles here.
  function itemGuid(item) {
    return (item['guid'] && item['guid']['#value'] ||
            item['link'] || item['title']);
  }

  // Render an item, and optionally animate its appearance on the page.
  function renderItem(item, animate) {
    // Have we already rendered this item?  If so, bail.
    var guid = itemGuid(item);
    if (guids[guid])
      return;
    guids[guid] = true;

    // Clean up some fields so mustache can render them.
    if (item['title'])
      item['title'] = html_sanitize(item['title']);
    if (item['description'])
      item['description'] = html_sanitize(item['description']);
    if (item['receivedDate'])
      item['receivedDate'] = prettyDate(item['receivedDate']);

    // Render our item as HTML, and optionally animate it into place.
    var html = $(tmpl('item_tmpl', item));
    if (animate) {
      html.prependTo('#hose');
    } else {
      $('.item').stop(true, true); // Finish existing animations now.
      $(tmpl('item_tmpl', item)).hide().prependTo('#hose').slideDown();
    }
  }

  // Connect to the server, and handle our responses.
  function connectToServer() {
    $('#disconnected').hide();
    $('#connecting').show();

    // Set up a heartbeat timer that reloads the page if we lose a connection.
    // Socket.io tries to handle this, but occasionally fails.
    var last_heartbeat = new Date();
    function reload_if_dead() {
      if (new Date() - last_heartbeat > 5*60*1000)
        window.location.reload();
    }
    setInterval(reload_if_dead, 60*1000);

    // Connect to the server.
    var connected_at;
    var socket = new io.Socket();
    socket.connect();
    socket.on('connect', function () {
      $('#connecting').hide();
      connected_at = getTime();
    });

    // Process messages from the server.
    socket.on('message', function (msg) {
      if (msg['item']) {
        try {
          // If our connection is more than 5 seconds old, don't animate
          // anything.  Otherwise, do a slide animation.
          renderItem(msg['item'], getTime() - connected_at < 5000);
        } catch (error) {
          if (typeof(console) !== 'undefined')
            console.log(error);
        }
      } else if (msg['command'] === 'heartbeat') {
        // Update our heartbeat.
        last_heartbeat = new Date();
      }
    });
    socket.on('disconnect', reconnect);
  }

  // Schedule a reconnection attempt shortly.  Note that this function
  // does not currently get called if a connection attempt fails.
  function reconnect() {
    $('#disconnected').show();
    setTimeout(connectToServer, (20+30*Math.random())*1000);
  }

  // Ask jQuery to run this code once the page is fully loaded.
  $(connectToServer);
})();
