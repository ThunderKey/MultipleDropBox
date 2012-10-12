/*
 * HTML5 drag and drop plugin for jQuery for multiple boxes
 * https://github.com/ThunderKey/MultipleDropBox
 * 
 * Copyright 2012, Nicolas Ganz
 * Released under the MIT license.
 */

(function( $ ){
  var count = 0;
  var empty = function() {}
  
  function setConfig(oldConfig) {
    if(oldConfig == null) {
      oldConfig = {};
    }
    var config = {};
    
    config.onDrag         = ('onDrag' in oldConfig         ? oldConfig.onDrag         : empty);
    config.onDrop         = ('onDrop' in oldConfig         ? oldConfig.onDrop         : empty);
    config.onWrongElement = ('onWrongElement' in oldConfig ? oldConfig.onWrongElement : empty);
    config.groupId = count++;
    
    return config;
  }
  
  function createAndPushData(ele, key, data) {
    if(typeof($(ele).data(key)) === 'undefined') {
      $(ele).data(key, [data]);
    } else {
      $(ele).data(key).push(data);
    }
  }
  
  $.fn.multipleDropBox = function(elementsToDrag, config) {
    config = setConfig(config);
    
    $(elementsToDrag)
      .each(function(id, ele) {
        createAndPushData(ele, 'DropboxGroupIds', config.groupId);
        createAndPushData(ele, 'DropboxOnDragFuncs', config.onDrag);
      })
      .attr("draggable", "true")
      .on("dragstart", '', config, function(event) {
        var ev = event.originalEvent;
        var opts = event.data;
        
        ev.dataTransfer.setData('DropboxGroupIds', $(this).data('DropboxGroupIds'));
        var data = [], id;
        var onDragFuncs = $(this).data('DropboxOnDragFuncs');
        for(id in onDragFuncs) {
          var _data = onDragFuncs[id](ev, this);
          data.push(_data);
        }
        ev.dataTransfer.setData('DropboxData', JSON.stringify(data));
      });
    $(this)
      .data('DropboxConfig', config)
      .data('DropboxDragElements', elementsToDrag)
      .on("dragover", function(event) {
          event.originalEvent.preventDefault();
      })
      .on("drop", function(event) {
        var ev = event.originalEvent;
        var opts = $(this).data('DropboxConfig');
        var dragIds = ev.dataTransfer.getData('DropboxGroupIds');
        
        if(dragIds.indexOf(opts.groupId) != -1) {
          var data = JSON.parse(ev.dataTransfer.getData('DropboxData'));
          opts.onDrop(data[opts.groupId], ev);
        } else {
          opts.onWrongElement(ev);
        }
      });
  };
  
  $.fn.multipleDropBoxOff = function() {
    delete $(this).data('DropboxConfig');
    $(this)
      .off("dragover")
      .off("drop");
    var dragElements = $(this).data('DropboxDragElements');
    $(dragElements)
      .each(function(id, ele) {
        delete $(ele).data('DropboxGroupIds');
      })
      .attr("draggable", "false")
      .off("dragstart");
    
  };
})( jQuery );