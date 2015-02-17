
// Name:         Footprint.js
// Purpose:      Provides collision-resistant sidebar footnotes.
// Dependencies: jQuery, Love 
// Developer:    Troy Griggs 


;(function($) {

	// debouncing function from John Hann, via Paul Irish
	// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	(function(sr){
		var debounce = function (func, threshold, execAsap) {
			var timeout;

			return function debounced () {
				var obj = this, args = arguments;
				function delayed () {
					if (!execAsap)
						func.apply(obj, args);
					timeout = null;
				};

				if (timeout)
					clearTimeout(timeout);
				else if (execAsap)
					func.apply(obj, args);

				timeout = setTimeout(delayed, threshold || 100);
			};
		}
		// smartresize 
		$.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

	})('smartresize');

	var pluginName = 'footprint',
		defaults = {
			hidden: false,
			markers: '.body sup',
			notes: '.footnotes ol li, .footnotes ul li',
			container: '.footnotes',
			threshold: 768
		};

	function Plugin(element, options){
		this.element = element;
		this.opts = $.extend(defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
 
		this.init();
	};

	Plugin.prototype.init = function(){
		this.sels = {
			$win: $(window),
			$container: $(this.opts.container),
			$sups: $(this.opts.markers),
			$notes: $(this.opts.notes)
		};

		this.setNotes(this.sels.$sups, this.sels.$notes);
		this.repositionNotes();

		if (this.opts.hidden === true) {
			this.setHoverEvent();
		};
	};

	Plugin.prototype.setNotes = function (supers, notes) {
		var readyToMove = this.positionColumn();

		if ( !readyToMove ) { return };

		var bodyHeight = supers.parent().parent().offset().top,
			supHeight,
			curr, 
			prev,
			num,
			i;

		for(i=0; i < supers.length; i++){
			num = i+1;
			$(supers[i]).addClass("f-marker f-marker-" + num).data("note", "f-note-" + num);
			
			supHeight = $(supers[i]).offset().top;
			supAdjustment = $(supers[i]).css("top").split("px")[0];

			$(notes[i]).addClass("f-note f-note-" + num).css({
				"position": "absolute",
				"top": (supHeight - bodyHeight) + "px"
			});

			if ( i - 1 != -1 ) {
				prev = notes[i-1];
				curr = notes[i];
				this.detectCollision(prev, curr);
			};	
		};
	};

	Plugin.prototype.positionColumn = function () {
		var isReady = false;

		if (this.sels.$sups.length === this.sels.$notes.length) {
			this.sels.$container.removeClass("inactive").addClass("active");
			isReady = true;
		} else { 
			console.log("The number of superscripts don't match the number of notes");
		};
		return isReady;
	};

	Plugin.prototype.detectCollision = function(div1, div2) {
		if (this.opts.threshold > $(window).innerWidth()) return;
		var that = this,
			$div1 = $(div1),
			$div2 = $(div2),
			y1 = $div1.offset().top,
			h1 = $div1.outerHeight(true),
			elem1 = y1 + h1,
			y2 = $div2.offset().top,
			h2 = $div2.outerHeight(true),
			elem2 = y2 + h2,
			hasCollision = false;

		hasCollision = (elem1 < y2 || y1 > elem2) ? false : true;

		if (hasCollision) {
			$div2.css({ "top": parseFloat($div2.css("top")) + 20 + "px" });
			that.detectCollision($div1, $div2);
		};
		return;
	};

	Plugin.prototype.repositionNotes = function (flag, set) {
		var that = this,
			winWidth;

		this.sels.$win.smartresize(function(){
			winWidth = $(window).innerWidth();
			if ( winWidth > that.opts.threshold ) {
				that.setNotes(that.sels.$sups, that.sels.$notes);
			} 
			// else {
			// 	that.resetNotes();
			// }
		});
	};

	Plugin.prototype.resetNotes = function (flag) {
		if (this.sels.$container.hasClass("active")) {
			this.sels.$container.toggleClass("active").toggleClass("inactive");
			this.sels.$notes.removeAttr("style");
		}
	};

	Plugin.prototype.setHoverEvent = function() {
		var that = this,
			curNote,
			note;

		this.sels.$container.add(this.sels.$sups).addClass("hoverable");

		this.sels.$sups.hover(function(e){
			note = "." + $(this).data("note");
			curNote = $(that.sels.$container.find(note));
			curNote.toggleClass("hovered");
		});
	};

	$.fn[pluginName] = function (options) {
		return this.each(function(){
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
			}
		});
	}
})(jQuery);


// IMPLEMENTATION
// $(".body sup").footprint({
// 	notes: ".footnotes li",
// 	container: ".footnotes"
// });


