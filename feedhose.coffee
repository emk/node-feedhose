# Require the modules we need.
http = require 'http'
url = require 'url'
events = require 'events'

# Connects to a remote feedhose server and notifies us when new RSS items
# arrive.
class exports.Client extends events.EventEmitter
  constructor: (@url) ->
    @on 'error', @_on_listener_error
    parsed_url = url.parse(@url)
    @recent_items = []
    @last_response = null
    @_port = parsed_url['port'] || 80
    @_host = parsed_url['host']
    @_pathname = parsed_url['pathname'] ? '/'
    @_http_client = http.createClient @_port, @_host
    @_http_client.on 'error', @_on_error
    @_request_items()

  # Figure out which URL path to query.
  _path: ->
    if @seed?
      "#{@_pathname}?name=mix&format=json&seed=#{@seed}"
    else
      "#{@_pathname}recent?name=mix&format=json"

  # Start an HTTP request.
  _request_items: =>
    try
      req = @_http_client.request 'GET', @_path(), host: @_host
      req.end()
      req.on 'response', @_on_response
      req.on 'error', @_on_error
    catch error
      @_on_error(error)

  # Called when we receive a response to our HTTP request.
  _on_response: (res) =>
    try
      unless res.statusCode is 200
        throw "Unexpected HTTP status code: #{res.statusCode}"
      res.setEncoding 'utf8'
      @data = []
      res.on 'error', @_on_error
      res.on 'data', (chunk) =>
        try
          @data.push chunk
        catch error
          @_on_error(error)
      res.on 'end', =>
        try
          @last_response = new Date()
          @_on_json @data.join('')
          @data = []
        catch error
          @_on_error(error)
    catch error
      @_on_error(error)

  # We've received some JSON!  Parse it and notify our listeners.
  _on_json: (unparsed_json) ->
    console.log("JSON: #{unparsed_json}")
    json = JSON.parse(unparsed_json)['feedHose']
    @seed = json['metadata']['seed']
    if json['items']
      # Fix strange JSON encoding.
      items_or_item = json['items']['item']
      items = if items_or_item.length? then items_or_item else [items_or_item]
      items.reverse()
      for item in items
        item['receivedDate'] = new Date()
        @_remember_item(item)
        @emit('item', item)
    @_request_items()

  # Remember the most recent items so we can prime new connections.
  _remember_item: (item) ->
    @recent_items.push(item)
    if @recent_items.length > 10
      @recent_items = @recent_items.slice(1)

  # Log an error to the console, wait 3 minutes, and try again.
  _on_error: (error) =>
    console.log "ERROR: #{error}\n#{error.stack}"
    setTimeout @_request_items, 3*60*1000

  # Called when a listener fails.  Just log the error and let our
  # regular code continue.
  _on_listener_error: (error) =>
    console.log "LISTENER ERROR: #{error}\n#{error.stack}"
